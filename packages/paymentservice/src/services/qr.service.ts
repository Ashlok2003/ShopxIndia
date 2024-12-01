import QRCode from "qrcode";
import RedisCache from "../config/cache";
import { Logger } from "../utils/logger";
import { QRCodeData, QRValidationResult } from "../interfaces/qrcode";
import { QR_SERVICE_ERROR_CODES, QR_SERVICE_ERROR_MESSAGES } from "../errors/errorCode";
import { DatabaseException, InvalidPaymentDataException, PaymentNotFoundException, QRCodeExpiredException, QRCodeGenerationException, QRCodeNotFoundException, QRCodeValidationException } from "../errors/customError";
import { Payment, PaymentStatus } from "@prisma/client";
import { PaymentService } from "./payment.service";
import { InterPaymentMessageService } from "./intermessage.service";
import { ORDER_PAYMENT_STATUS } from "../interfaces/order";
import { PaymentRepository } from "../repository/payment.repository";
import { CreatePaymentInput, PAYMENT_TYPE, PaymentValidationInput } from "../interfaces/payment";
import { z } from "zod";

export class QRService {

    private logger: Logger = Logger.getInstance({ serviceName: "QRService", logLevel: "debug" });
    private static readonly CODE_EXPIRATION_TIME_MS = 50 * 60 * 1000;

    private paymentService: PaymentService;
    private paymentRepository: PaymentRepository;
    private messageService: InterPaymentMessageService | null = null;

    constructor() {
        this.paymentRepository = new PaymentRepository();
        this.paymentService = new PaymentService();
    }

    public setMessageClient(messageService: InterPaymentMessageService): void {
        this.messageService = messageService;
    }

    public async generateQRCode(): Promise<QRCodeData> {
        try {
            const code = this.generateSixDigitCode();
            const qrString = await QRCode.toDataURL(code, { errorCorrectionLevel: "H" });

            await RedisCache.set(code, { timeStamp: Date.now() }, QRService.CODE_EXPIRATION_TIME_MS / 1000);

            return { qrString, code };

        } catch (error: any) {
            this.logger.error("Error generating QR code:", error.message);

            throw new QRCodeGenerationException({
                message: QR_SERVICE_ERROR_MESSAGES[QR_SERVICE_ERROR_CODES.QR_GENERATION_FAILED],
                details: error,
            });
        }
    }

    public async inititePaymentProcess({ userId, orderId, totalAmount }: CreatePaymentInput): Promise<Payment> {
        try {
            const { qrString, code } = await this.generateQRCode();
            return await this.paymentRepository.createPayment({ userId, orderId, totalAmount }, qrString);
        } catch (error: any) {
            this.logAndRethrowError("Error creating payment of orderId", { orderId }, error);
        }
    }

    public async validatePayment({ orderId, code }: PaymentValidationInput): Promise<QRValidationResult> {

        const paymentDetails = await this.paymentService.getPaymentByOrderId(orderId);

        if(!paymentDetails) {
            throw new PaymentNotFoundException("Invalid Payment Processing Request !");
        }

        try {
            const storedCode = await RedisCache.get<{ timeStamp: number }>(code);

            if (!storedCode) {
                throw new QRCodeNotFoundException({ code });
            }

            const currentTime = Date.now();
            const isExpired = currentTime - storedCode.timeStamp > QRService.CODE_EXPIRATION_TIME_MS;

            if (isExpired) {
                await RedisCache.del(code);
                throw new QRCodeExpiredException({ code });
            }

            await RedisCache.del(code);

            await this.paymentRepository.completePayment({
                paymentId: paymentDetails.paymentId,
                orderId,
                code
            });

            this.messageService!.responsePaymentStatusToOrder({
                type: ORDER_PAYMENT_STATUS.SUCCESS,
                data: {
                    orderId,
                    paymentId: paymentDetails.paymentId,
                    paymentStatus: ORDER_PAYMENT_STATUS.SUCCESS
                }
            });

            this.messageService!.requestPaymentConfirmationMail({
                amount: paymentDetails.amount,
                orderId: paymentDetails.orderId,
                type: PAYMENT_TYPE.CONFIRMATION,
                userId: paymentDetails.userId,
                receiptLink: "http://www.shopxindia.com",
                retryPaymentLink: "http://www.shopxindia.com",
                supportLink: "http://www.shopxindia.com"

            });

            return {
                status: PaymentStatus.SUCCESS,
                message: "Code is valid",
            };

        } catch (error: any) {
            if (error instanceof QRCodeNotFoundException) {
                return {
                    status: PaymentStatus.FAILED,
                    message: "Code not found or already used",
                };
            }

            if (error instanceof QRCodeExpiredException) {
                return {
                    status: PaymentStatus.FAILED,
                    message: "Code has expired",
                };
            }

            this.logger.error("Error validating QR code:", error.message);

            this.messageService!.responsePaymentStatusToOrder({
                type: ORDER_PAYMENT_STATUS.FAILED,
                data: {
                    orderId,
                    paymentId: paymentDetails.paymentId,
                    paymentStatus: ORDER_PAYMENT_STATUS.FAILED
                }
            });

            throw new QRCodeValidationException({
                message: QR_SERVICE_ERROR_MESSAGES[QR_SERVICE_ERROR_CODES.QR_VALIDATION_FAILED],
                details: error,
            });
        }
    }

    public async cleanUpExpiredCodes(): Promise<void> {
        try {
            const keys = await RedisCache.getKeysByPattern("*");
            const currentTime = Date.now();

            for (const key of keys) {
                const storedCode = await RedisCache.get<{ timeStamp: number }>(key);

                if (storedCode && (currentTime - storedCode.timeStamp) > QRService.CODE_EXPIRATION_TIME_MS) {
                    await RedisCache.del(key);
                }
            }

        } catch (error: any) {
            this.logger.error(`Error cleaning up expired codes: ${error.message}`);
            throw new Error(QR_SERVICE_ERROR_MESSAGES[QR_SERVICE_ERROR_CODES.SERVER_ERROR]);
        }
    }

    private generateSixDigitCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private logAndRethrowError(message: string, context: Record<string, unknown>, error: any): never {
        if (error instanceof z.ZodError) {
            this.logger.error(`${message} - Validation Error`, { context, issues: error.errors });
            throw new InvalidPaymentDataException("Invalid input data. Check the provided details.");
        }
        
        this.logger.error(message, { context, error: error.message });
        throw error instanceof DatabaseException ? error : new DatabaseException(error.message);
    }
}