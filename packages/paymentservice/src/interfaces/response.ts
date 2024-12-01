
interface CreatePaymentResponse {
    paymentId: string;
    orderId: string;
    userId: string;
}


interface GenerateQRResponse {
    qrCode: string;
    paymentId: string;
    amount: number;
    currency: string;
}

interface PaymentSuccessMessageResponse {
    status: string;
    message: string;
}

export { CreatePaymentResponse, GenerateQRResponse, PaymentSuccessMessageResponse };