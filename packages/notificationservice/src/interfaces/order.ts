
enum ORDER_TYPE {
    CONFIRMATION = "CONFIRMATION",
    CANCELLATION = "CANCELLATION"
}

interface OrderItem {
    productId: string;
    quantity: number;
    productPrice: number;
}

interface OrderConfirmationData {
    userId: string;
    orderId: string;
    orderDate: string;
    orderItems: OrderItem[];
    totalAmount: string;
    orderLink: string;
}

interface OrderCancellationData {
    userId: string;
    orderId: string;
    reason: string;
    supportLink: string;
}

interface OrderRequest {
    type: ORDER_TYPE,
    cancellationData?: OrderCancellationData,
    confirmationData?: OrderConfirmationData
}

export { OrderItem, OrderCancellationData, OrderConfirmationData, OrderRequest, ORDER_TYPE };