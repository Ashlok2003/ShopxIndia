
enum PAYMENT_TYPE {
    CANCELLATION = "CANCELLATION",
    CONFIRMATION = "CONFIRMATION"
}

interface PaymentRequest {
    type: PAYMENT_TYPE,
    userId: string;
    orderId: string;
    amount: string;
    receiptLink?: string;
    retryPaymentLink?: string;
    supportLink?: string;
}

enum ORDER_PAYMENT_STATUS {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PENDING = "PENDING"
}

interface Payment {
    paymentId: string;
    orderId: string;
    paymentStatus: ORDER_PAYMENT_STATUS
}

interface OrderPaymentResponse {
    type: ORDER_PAYMENT_STATUS;
    data: Payment
}

export { Payment, ORDER_PAYMENT_STATUS, OrderPaymentResponse, PAYMENT_TYPE, PaymentRequest };