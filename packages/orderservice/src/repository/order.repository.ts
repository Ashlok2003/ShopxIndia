import { Order, ORDER_STATUS, OrderItem, PAYMENT_STATUS } from "@prisma/client";
import prisma from "../config/prisma";
import { ErrorFetchingOrderDetailsException, OrderCancellationNotAllowedException, OrderCreationFailedException, OrderNotFoundException, OrderUpdateNotAllowedException, ProductNotFoundException } from "../error/customError";
import { OrderInput, OrderUpdateInput } from "../interfaces/order";
import { Pagination } from "../interfaces/pagination";
import { Product } from "../interfaces/product";
import { OrderListData } from "../interfaces/response";
import { Payment } from "../interfaces/payment";


export class OrderRepository {
    constructor() { }

    public async createOrder(orderInput: OrderInput, productDetails: Product[]): Promise<Order> {
        try {
            const { userId, orderItems } = orderInput;

            const productLookup = new Map(productDetails.map((p) => [p.productId, p]));

            const preparedItems = orderItems.map((item) => {
                const product = productLookup.get(item.productId);
                if (!product) {
                    throw new ProductNotFoundException(`Invalid product ID: ${item.productId}`);
                }

                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    productPrice: product.productPrice,
                    sellerId: product.sellerId,
                    totalPrice: item.quantity * product.productPrice,
                };
            });

            const totalAmount = preparedItems.reduce((sum, item) => sum + item.totalPrice, 0);

            const order = await prisma.$transaction(async (tx) => {
                const createdOrder = await tx.order.create({
                    data: {
                        userId,
                        totalAmount,
                        orderStatus: ORDER_STATUS.PENDING,
                        paymentStatus: PAYMENT_STATUS.PENDING,
                    },
                });

                await tx.orderItem.createMany({
                    data: preparedItems.map((item) => ({
                        orderOrderId: createdOrder.orderId,
                        productId: item.productId,
                        quantity: item.quantity,
                        productPrice: item.productPrice,
                        sellerId: item.sellerId,
                    })),
                });

                return createdOrder;
            });

            return order;
        } catch (error) {
            console.error("Error creating order:", error);
            throw new OrderCreationFailedException(error);
        }
    }

    public async updateOrder(orderUpdateInput: OrderUpdateInput, productDetails: Product[]) {

        try {
            const { orderId, status, orderItems } = orderUpdateInput;

            const productMap = new Map<string, Product>();

            productDetails.forEach(product => {
                productMap.set(product.productId, product);
            });

            const updatedOrder = await prisma.$transaction(async (tx) => {
                const existingOrder = await tx.order.findUnique({
                    where: { orderId },
                    include: { orderItems: true }
                });

                if (!existingOrder) {
                    throw new OrderNotFoundException(`Order not found for ID: ${orderId}`);
                }


                let totalAmount = existingOrder.totalAmount;

                if (orderItems && orderItems.length > 0) {
                    totalAmount = orderItems.reduce((sum, item) => {
                        const product = productMap.get(item.productId);

                        if (!product) {
                            throw new ProductNotFoundException(`Invalid product ID: ${item.productId}`);
                        }

                        return sum + (item.quantity ?? 1) * product.productPrice;
                    }, 0);
                }

                await Promise.all(orderItems.map((item) => {
                    const product = productMap.get(item.productId);

                    tx.orderItem.update({
                        where: { id: item.orderItemId },
                        data: {
                            productId: item.productId,
                            quantity: item.quantity,
                            productPrice: product?.productPrice,
                        }
                    });
                }));

                return await tx.order.update({
                    where: { orderId },
                    data: {
                        totalAmount,
                        orderStatus: status || existingOrder.orderStatus,
                    },
                    include: {
                        orderItems: true
                    }
                });
            }, {
                maxWait: 5000,
                timeout: 10000
            });

            return updatedOrder;

        } catch (error: any) {
            console.error("Error updating order:", error);
            throw new OrderUpdateNotAllowedException(error.message);
        }
    }

    public async getAllOrders(pagination: Pagination): Promise<OrderListData> {
        try {
            const { skip, take } = pagination;

            const [order, total] = await prisma.$transaction([
                prisma.order.findMany({
                    skip,
                    take,
                    orderBy: { createdAt: "desc" },
                    include: {
                        orderItems: true
                    }
                }),
                prisma.order.count(),
            ]);

            return { orders: order, total };

        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw new ErrorFetchingOrderDetailsException(error);
        }
    }

    public async getOrder(orderId: string): Promise<Order> {
        try {
            const order = await prisma.order.findUnique({ where: { orderId }, include: { orderItems: true } });

            if (!order) {
                throw new OrderNotFoundException(`Order not found for ID: ${orderId}`);
            }

            return order;
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw new ErrorFetchingOrderDetailsException(error);
        }
    }

    public async getOrders(userId: string): Promise<Order[]> {
        try {
            const orders = await prisma.order.findMany({
                where: { userId },
                include: {
                    orderItems: true
                }
            });

            return orders;
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw new ErrorFetchingOrderDetailsException(error);
        }
    }

    public async cancelOrder(orderId: string): Promise<Order> {
        try {

            const order = await prisma.order.update({
                where: { orderId },
                data: { orderStatus: ORDER_STATUS.FAILED },
            });

            return order;

        } catch (error) {
            console.error("Error canceling order:", error);
            throw new OrderCancellationNotAllowedException("Failed to cancel order.");
        }
    }

    public async updatePaymentStatus({ orderId, paymentId, paymentStatus }: Payment): Promise<void> {
        try {
            await prisma.order.update({
                where: { orderId: orderId },
                data: {
                    paymentId: paymentId,
                    paymentStatus,
                    orderStatus: "SUCCESS"
                }
            });

        } catch (error: any) {
            console.error("Error updating order:", error);
            throw new OrderUpdateNotAllowedException(error.message);
        }
    }

    public async getOrderWithItems(orderId: string): Promise<{ order: Order, orderItems: OrderItem[] }> {
        try {

            const order = await prisma.order.findUnique({ where: { orderId }, include: { orderItems: true } });

            if (!order) {
                throw new OrderNotFoundException(`Order not found for ID: ${orderId}`);
            }

            return { order, orderItems: order.orderItems };

        } catch (error) {
            console.error("Error fetching orders:", error);
            throw new ErrorFetchingOrderDetailsException(error);
        }
    }

}