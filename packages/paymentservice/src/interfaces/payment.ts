
interface CreatePaymentInput {
    userId: string;
    orderId: string;
    totalAmount: number;
}

interface CompletePaymentInput {
    paymentId: string;
    orderId: string;
    code: string;
}

interface PaymentValidationInput {
    orderId: string;
    code: string;
}

interface CancelPaymentInput {
    paymentId: string;
}

interface RefundPaymentInput {
    paymentId: string;
}

enum PAYMENT_TYPE {
    CANCELLATION = "CANCELLATION",
    CONFIRMATION = "CONFIRMATION"
}

interface PaymentRequest {
    type: PAYMENT_TYPE,
    orderId: string;
    userId: string;
    amount: number;
    receiptLink?: string;
    retryPaymentLink?: string;
    supportLink?: string;
}



export { PAYMENT_TYPE, PaymentRequest, CompletePaymentInput, PaymentValidationInput, CancelPaymentInput, RefundPaymentInput, CreatePaymentInput };