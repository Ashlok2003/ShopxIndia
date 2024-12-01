import { Payment, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { DatabaseException, InvalidPaymentDataException, PaymentCancellationNotAllowedException, PaymentRefundNotAllowedException } from "../errors/customError";
import { CompletePaymentInput } from "../interfaces/payment";
import { PaymentRepository } from "../repository/payment.repository";
import { Logger } from "../utils/logger";
import { CompletePaymentInputSchema, OrderIdSchema, PaymentIdSchema, PaymentStatusEnum, UserIdSchema } from "../validations/payment.validation";


export class PaymentService {
    private paymentRepository: PaymentRepository;
    private logger: Logger = Logger.getInstance({ serviceName: "PaymentService", logLevel: "debug" })

    constructor() {
        this.paymentRepository = new PaymentRepository();
    }

    public async getPaymentById(paymentId: string): Promise<Payment> {
        try {
            PaymentIdSchema.parse(paymentId);
            const payment = await this.paymentRepository.getPaymentById(paymentId);
            if (!payment) throw new InvalidPaymentDataException(`Payment not found with ID: ${paymentId}`);

            return payment;
        } catch (error: any) {
            this.logAndRethrowError("Error fetching payment by ID", { paymentId }, error);
        }
    }

    public async getPaymentByUserId(userId: string): Promise<Payment[]> {
        try {
            UserIdSchema.parse(userId);
            return await this.paymentRepository.getPaymentByUserId(userId);
        } catch (error: any) {
            this.logAndRethrowError("Error fetching payments by user ID", { userId }, error);
        }
    }

    public async getPaymentByStatus(status: PaymentStatus): Promise<Payment[]> {
        try {
            PaymentStatusEnum.parse(status);
            return await this.paymentRepository.getPaymentByStatus(status);
        } catch (error: any) {
            this.logAndRethrowError("Error fetching payments by status", { status }, error);
        }
    }

    public async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
        try {
            OrderIdSchema.parse(orderId);
            return await this.paymentRepository.getPaymentByOrderId(orderId);
        } catch (error: any) {
            this.logAndRethrowError("Error fetching payments by orderId", { orderId }, error);
        }
    }

    public async completePayment(input: CompletePaymentInput): Promise<Payment> {
        try {
            const validatedInput = CompletePaymentInputSchema.parse(input);
            const payment = await this.paymentRepository.completePayment(validatedInput);

            if (!payment) throw new InvalidPaymentDataException("Payment completion failed.");

            return payment;
        } catch (error: any) {
            this.logAndRethrowError("Error completing payment", { input }, error);
        }
    }

    public async cancelPayment(paymentId: string): Promise<Payment> {
        try {
            PaymentIdSchema.parse(paymentId);
            const payment = await this.paymentRepository.cancelPayment(paymentId);
            if (!payment) throw new PaymentCancellationNotAllowedException(`Payment cancellation failed for ID: ${paymentId}`);

            return payment;
        } catch (error: any) {
            this.logAndRethrowError("Error cancelling payment", { paymentId }, error);
        }
    }

    public async refundPayment(paymentId: string): Promise<Payment> {
        try {
            PaymentIdSchema.parse(paymentId);
            const payment = await this.paymentRepository.refundPayment(paymentId);

            if (!payment) throw new PaymentRefundNotAllowedException(`Payment refund failed for ID: ${paymentId}`);

            return payment;
        } catch (error: any) {
            this.logAndRethrowError("Error refunding payment", { paymentId }, error);
        }
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