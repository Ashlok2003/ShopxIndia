import { Payment, PaymentStatus } from "@prisma/client";
import { pubsub } from "../config/subscription";
import { CompletePaymentInput, PaymentValidationInput } from "../interfaces/payment";
import { graphqlErrorHandler } from "../middlewares/errorHandler";
import { InterPaymentMessageService } from "../services/intermessage.service";
import { PaymentService } from "../services/payment.service";
import { QRService } from "../services/qr.service";

const paymentService = new PaymentService();
const qrService = new QRService();
const messageService = new InterPaymentMessageService(qrService);
qrService.setMessageClient(messageService);


const resolvers = {

    Query: {
        getPaymentById: graphqlErrorHandler(async (_: any, { paymentId }: { paymentId: string }) => {
            return paymentService.getPaymentById(paymentId);
        }),

        getPaymentByUserId: graphqlErrorHandler(async (_: any, { userId }: { userId: string }) => {
            return paymentService.getPaymentByUserId(userId);
        }),

        getPaymentByStatus: graphqlErrorHandler(async (_: any, { status }: { status: PaymentStatus }) => {
            return paymentService.getPaymentByStatus(status);
        }),

        getPaymentByOrderId: graphqlErrorHandler(async (_: any, { orderId }: { orderId: string }) => {
            return paymentService.getPaymentByOrderId(orderId);
        }),
    },

    Mutation: {
        validatePayment: graphqlErrorHandler(async (_:any, {input} : {input: PaymentValidationInput}) => {
            const validatedPayment = await qrService.validatePayment(input);
            await pubsub.publish("PAYMENT_STATUS_UPDATED", { paymentStatusUpdated: validatedPayment });
            return validatedPayment;
        }),

        cancelPayment: graphqlErrorHandler(async (_: any, { paymentId }: { paymentId: string }) => {
            const canceledPayment = await paymentService.cancelPayment(paymentId);
            await pubsub.publish("PAYMENT_STATUS_UPDATED", { paymentStatusUpdated: canceledPayment });
            return canceledPayment;
        }),

        refundPayment: graphqlErrorHandler(async (_: any, { paymentId }: { paymentId: string }) => {
            const refundedPayment = await paymentService.refundPayment(paymentId);
            await pubsub.publish("PAYMENT_REFUNDED", { paymentRefunded: refundedPayment });
            return refundedPayment;
        })
    },

    Payment: {
        __resolveReference: graphqlErrorHandler(async (reference: { userId: string }) => {
            return await paymentService.getPaymentByUserId(reference.userId);
        }),

        user: graphqlErrorHandler((reference: { userId: string }) => {
            return { __typename: "User", userId: reference.userId };
        }),

        order: graphqlErrorHandler((reference: { orderId: string }) => {
            return { __typename: "Order", orderId: reference.orderId };
        }),
    },

    PaymentList : {
        __resolveReference: graphqlErrorHandler(async (reference: { userId: string }) => {
            return await paymentService.getPaymentByUserId(reference.userId);
        }),
    },

    Subscription: {
        paymentStatusUpdated: {
            resolve: (payload: { paymentStatusUpdated: Payment }) => {
                return payload.paymentStatusUpdated;
            },

            subscribe: (_: any, args: any) => {
                return pubsub.asyncIterator(["PAYMENT_STATUS_UPDATED"]);
            },
        },

        paymentRefunded: {
            resolve: (payload: { paymentRefunded: Payment }) => {
                return payload.paymentRefunded;
            },

            subscribe: (_: any, args: any) => {
                return pubsub.asyncIterator(["PAYMENT_REFUNDED"]);
            },
        }

    }
}

export default resolvers;