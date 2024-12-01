
enum PAYMENT_STATUS {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
    PENDING = "PENDING"
}

interface Payment {
    paymentId: string;
    orderId: string;
    paymentStatus: PAYMENT_STATUS
}

interface PaymentResponse {
    type: PAYMENT_STATUS;
    data: Payment
}

interface PaymentRequest {
    orderId: string;
    userId: string;
    totalAmount: number;
}

export { PAYMENT_STATUS, Payment, PaymentResponse, PaymentRequest };