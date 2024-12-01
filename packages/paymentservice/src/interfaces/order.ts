
interface OrderRequest {
    orderId: string;
    userId: string;
    totalAmount: number;
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

export { OrderRequest, OrderPaymentResponse, ORDER_PAYMENT_STATUS };