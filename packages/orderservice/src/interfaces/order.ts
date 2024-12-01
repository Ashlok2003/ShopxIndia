import { ORDER_STATUS, OrderItem } from "@prisma/client";

interface OrderInput {
    userId: string;
    orderItems: Array<OrderItemInput>;
}

interface OrderItemInput {
    productId: string;
    quantity: number;
}

interface OrderItemUpdateInput {
    orderItemId: string;
    quantity?: number;
    productId: string;
}

interface OrderUpdateInput {
    orderId: string;
    status?: ORDER_STATUS;
    orderItems: Array<OrderItemUpdateInput>;
}

interface OrderConfirmationData {
    userId: string;
    orderId: string;
    orderDate: Date;
    orderItems: OrderItem[];
    totalAmount: number;
    orderLink: string;
}

interface OrderCancellationData {
    userId: string;
    orderId: string;
    reason: string;
    supportLink: string;
}

enum ORDER_TYPE {
    CONFIRMATION = "CONFIRMATION",
    CANCELLATION = "CANCELLATION"
}

interface OrderRequest {
    type: ORDER_TYPE,
    cancellationData?: OrderCancellationData,
    confirmationData?: OrderConfirmationData
}


export {OrderRequest, ORDER_TYPE, OrderConfirmationData, OrderCancellationData, OrderInput, OrderItemInput, OrderItemUpdateInput, OrderUpdateInput };
