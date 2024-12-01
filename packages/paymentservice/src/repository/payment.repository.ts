import { Payment, PaymentStatus } from "@prisma/client";
import { CompletePaymentInput, CreatePaymentInput } from "../interfaces/payment";
import prisma from "../config/prisma";
import { DatabaseException, PaymentNotFoundException, InvalidPaymentStatusTransitionException } from '../errors/customError';
import { Logger } from "../utils/logger";


export class PaymentRepository {

    constructor(private readonly logger = Logger.getInstance({ serviceName: "PaymentRepository", logLevel: "debug" })) { }

    public async createPayment({ userId, orderId, totalAmount }: CreatePaymentInput, qrString: string): Promise<Payment> {
        try {
            return await prisma.payment.create({
                data: {
                    userId,
                    orderId,
                    amount: totalAmount,
                    currency: "INR",
                    timeStamp: new Date(Date.now()),
                    status: PaymentStatus.PENDING,
                    qrString
                }
            });
        } catch (error: any) {
            this.logger.error("Error Creating Payment");
            throw new DatabaseException(error.message);
        }
    }

    public async getPaymentById(paymentId: string): Promise<Payment> {
        try {
            const payment = await prisma.payment.findUnique({
                where: { paymentId }
            });

            if (!payment) {
                throw new PaymentNotFoundException(`There is no such payment exists with ID: ${paymentId}`);
            }

            return payment;

        } catch (error: any) {
            this.logger.error("Error Getting Payment with Payment ID: ", paymentId);
            throw new DatabaseException(error.message);
        }
    }

    public async getPaymentByUserId(userId: string): Promise<Payment[]> {
        try {
            return await prisma.payment.findMany({
                where: { userId }
            });

        } catch (error: any) {
            this.logger.error("Error Getting Payment with User ID: ", userId);
            throw new DatabaseException(error.message);
        }
    }

    public async getPaymentByStatus(status: PaymentStatus): Promise<Payment[]> {
        try {
            return await prisma.payment.findMany({
                where: { status },
            });

        } catch (error: any) {
            this.logger.error("Error Getting Payment with Payment Status: ", status);
            throw new DatabaseException(error.message);
        }
    }

    public async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
        try {

            const result = await prisma.payment.findFirst({
                where: { orderId },
            });

            if (!result) {
                throw new PaymentNotFoundException("There is no such payment associated with orderId!");
            }

            console.log(result);

            return result;

        } catch (error: any) {
            this.logger.error("Error Getting Payment with Order ID: ", orderId);
            throw new DatabaseException(error.message);
        }
    }

    public async completePayment({ paymentId, orderId }: CompletePaymentInput): Promise<Payment> {
        try {

            return await prisma.$transaction(async (tx) => {
                const payment = await tx.payment.findUnique({
                    where: { paymentId }
                });

                if (!payment) {
                    throw new PaymentNotFoundException(`There is no such payment exists with ID: ${paymentId}`);
                }

                if (payment.status !== PaymentStatus.PENDING) {
                    throw new InvalidPaymentStatusTransitionException(`Couldn't complete payment since it is already ${payment.status}`);
                }

                return await tx.payment.update({
                    where: { paymentId },
                    data: {
                        orderId,
                        status: "SUCCESS"
                    },
                });
            });
        } catch (error: any) {
            this.logger.error(`Error completing the Payment`, {
                paymentId,
                orderId,
                error: error.message,
            });

            if (error instanceof PaymentNotFoundException || error instanceof InvalidPaymentStatusTransitionException) {
                throw error;
            }

            throw new DatabaseException(error.message);
        }
    }

    public async cancelPayment(paymentId: string): Promise<Payment> {
        try {
            return await prisma.$transaction(async (tx) => {
                const payment = await tx.payment.findUnique({
                    where: { paymentId },
                });

                if (!payment) {
                    throw new PaymentNotFoundException(paymentId);
                }

                if (payment.status === PaymentStatus.CANCELLED || payment.status === PaymentStatus.SUCCESS) {
                    throw new InvalidPaymentStatusTransitionException(`Couldn't cancelled payment since it is already ${payment.status}`);
                }

                return await tx.payment.update({
                    where: { paymentId },
                    data: {
                        status: "CANCELLED"
                    },
                });
            });
        } catch (error: any) {
            this.logger.error("Error cancelling the Payment with payment ID: ", paymentId);

            if (error instanceof PaymentNotFoundException || error instanceof InvalidPaymentStatusTransitionException) {
                throw error;
            }

            throw new DatabaseException(error.message);
        }
    }

    public async refundPayment(paymentId: string): Promise<Payment> {
        try {

            const payment = await prisma.payment.findUnique({
                where: { paymentId },
            });

            if (!payment) {
                throw new PaymentNotFoundException(paymentId);
            }

            if (payment.status !== PaymentStatus.SUCCESS) {

                throw new InvalidPaymentStatusTransitionException(
                    `Couldn't refund payment since it is already ${payment.status}`
                );
            }

            const updatedPayment = await prisma.payment.update({
                where: { paymentId },
                data: { status: "REFUNDED" },
            });

            return updatedPayment;
        } catch (error: any) {
            this.logger.error(`Error refunding the Payment with payment ID:  ${paymentId}`, error);

            if (error instanceof PaymentNotFoundException || error instanceof InvalidPaymentStatusTransitionException) {
                throw new InvalidPaymentStatusTransitionException(error);
            }

            if (error.code === "P2025") { 
                throw new PaymentNotFoundException(error);
            }

            throw new DatabaseException(error.message || "Unexpected database error.");
        }
    }

}