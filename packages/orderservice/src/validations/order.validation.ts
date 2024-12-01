import { z } from 'zod';

const OrderStatus = z.enum([
    "PENDING",
    "SUCCESS",
    "FAILED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
]);

const OrderItemInputSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
});

const OrderItemUpdateInputSchema = z.object({
    orderItemId: z.string().min(1, "Order Item ID is required"),
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
});

const OrderInputSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    orderItems: z.array(OrderItemInputSchema).min(1, "Order must have at least one item"),
});

const OrderUpdateInputSchema = z
    .object({
        orderId: z.string().min(1, "Order ID is required"),
        status: OrderStatus.optional(),
        orderItems: z.array(OrderItemUpdateInputSchema),
    })
    .refine(
        (data) => data.status !== undefined || data.orderItems?.length > 0,
        {
            message: "Either 'status' or 'orderItems' must be provided to update the order.",
        }
    );

const PaginationSchema = z.object({
    take: z.number().int().min(1, "Take must be at least 1"),
    skip: z.number().int().min(0, "Skip cannot be negative"),
});


export {
    OrderInputSchema,
    OrderItemInputSchema,
    OrderUpdateInputSchema,
    OrderStatus,
    PaginationSchema,
};