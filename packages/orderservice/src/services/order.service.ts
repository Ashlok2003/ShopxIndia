import { ZodError } from "zod";
import { BusinessException, ProductNotFoundException } from "../error/customError";
import { ORDER_TYPE, OrderInput, OrderUpdateInput } from "../interfaces/order";
import { Pagination } from "../interfaces/pagination";
import { Payment } from "../interfaces/payment";
import { ErrorResponse, SuccessResponse } from "../interfaces/response";
import { OrderRepository } from "../repository/order.repository";
import { Logger } from "../utils/logger";
import { OrderInputSchema, OrderUpdateInputSchema, PaginationSchema } from "../validations/order.validation";
import { InterMessageService } from "./intermessage.service";
import { Order, OrderItem } from "@prisma/client";

export class OrderService {

    private logger: Logger = Logger.getInstance({ serviceName: "OrderService", logLevel: "debug" });
    private orderRepository: OrderRepository;
    private interMessageService: InterMessageService | null = null;

    constructor() {
        this.orderRepository = new OrderRepository();
    }

    public setInterMessageService(messageService: InterMessageService): void {
        this.interMessageService = messageService;
    }

    public async createOrder(orderInput: OrderInput): Promise<SuccessResponse | ErrorResponse> {
        try {

            const parsedOrderInput = OrderInputSchema.parse(orderInput);
            const productIds = parsedOrderInput.orderItems.map(item => item.productId);

            const productDetails = await this.interMessageService!.requestProductDetails(productIds);

            if (!productDetails) {
                throw new ProductNotFoundException("Error Getting Products from Product Service !");
            }

            const order = await this.orderRepository.createOrder(parsedOrderInput, productDetails);

            this.interMessageService!.requestPaymentInitiation({
                orderId: order.orderId,
                totalAmount: order.totalAmount,
                userId: order.userId
            });

            return { status: 200, data: order };
        } catch (error: any) {
            if (error instanceof ZodError) {
                return {
                    errorCode: 400,
                    errorMessage: error.errors.map((e) => e.message).join(", "),
                };
            }
            this.logger.error("Error creating order:", error);
            return {
                errorCode: 500,
                errorMessage: error.message || "Order creation failed",
            };
        }
    }

    public async updateOrder(orderUpdateInput: OrderUpdateInput): Promise<SuccessResponse | ErrorResponse> {
        try {
            const parsedOrderUpdateInput = OrderUpdateInputSchema.parse(orderUpdateInput);

            const productIds = parsedOrderUpdateInput.orderItems.map(item => item.productId);
            const productDetails = await this.interMessageService!.requestProductDetails(productIds);

            if (!productDetails) {
                throw new ProductNotFoundException("Error Getting Products from Product Service !");
            }

            const updatedOrder = await this.orderRepository.updateOrder(parsedOrderUpdateInput, productDetails);
            return { status: 200, data: updatedOrder };

        } catch (error: any) {
            if (error instanceof ZodError) {

                return {
                    errorCode: 400,
                    errorMessage: error.errors.map((e) => e.message).join(", "),
                };
            }

            this.logger.error("Error updating order:", error);
            return {
                errorCode: 500,
                errorMessage: error.message || "Order update failed",
            };
        }
    }

    public async getAllOrders(pagination: Pagination): Promise<SuccessResponse | ErrorResponse> {
        try {
            const parsedPagination = PaginationSchema.parse(pagination);

            const ordersData = await this.orderRepository.getAllOrders(parsedPagination);

            return { data: ordersData, status: 200 };

        } catch (error: any) {

            if (error instanceof ZodError) {
                return {
                    errorCode: 400,
                    errorMessage: error.errors.map((e) => e.message).join(", "),
                };
            }

            this.logger.error("Error fetching all orders:", error);
            return {
                errorCode: 500,
                errorMessage: error.message || "Failed to fetch orders",
            };
        }
    }

    public async getOrder(orderId: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            if (!orderId) {
                return { errorCode: 400, errorMessage: "Please Provide orderId !" };
            }

            const order = await this.orderRepository.getOrder(orderId);
            return { status: 200, data: order };

        } catch (error: any) {
            if (error instanceof ZodError) {
                return {
                    errorCode: 400,
                    errorMessage: error.errors.map((e) => e.message).join(", "),
                };
            }

            this.logger.error("Error fetching order:", error);
            return {
                errorCode: 404,
                errorMessage: error.message || "Order not found",
            };
        }
    }

    public async getOrdersByUserId(userId: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            if (!userId) {
                return { errorCode: 400, errorMessage: "Please Provide userId !" };
            }

            const orders = await this.orderRepository.getOrders(userId);

            return { status: 200, data: { total: orders.length, orders } };
        } catch (error: any) {
            if (error instanceof ZodError) {
                return {
                    errorCode: 400,
                    errorMessage: error.errors.map((e) => e.message).join(", "),
                };
            }

            this.logger.error("Error fetching orders by user ID:", error);

            return {
                errorCode: 404,
                errorMessage: error.message || "No orders found for the given user",
            };
        }
    }

    public async cancelOrder(orderId: string): Promise<SuccessResponse | ErrorResponse> {
        try {
            if (!orderId) {
                return { errorCode: 400, errorMessage: "Please Provide orderId !" };
            }

            const canceledOrder = await this.orderRepository.cancelOrder(orderId);

            await this.interMessageService!.requestOrderConfirmationMail({
                type: ORDER_TYPE.CANCELLATION,
                cancellationData: {
                    orderId: canceledOrder.orderId,
                    reason: "Order Successfully Cancelled !",
                    supportLink: "http://www.shopxindia.shop",
                    userId: canceledOrder.userId
                }
            });

            return { status: 200, data: canceledOrder };

        } catch (error: any) {
            if (error instanceof ZodError) {
                return {
                    errorCode: 400,
                    errorMessage: error.errors.map((e) => e.message).join(", "),
                };
            }

            this.logger.error("Error canceling order:", error);

            return {
                errorCode: 500,
                errorMessage: error.message || "Failed to cancel order",
            };
        }
    }

    public async updatePaymentStatus(payment: Payment): Promise<void> {
        try {

            await this.orderRepository.updatePaymentStatus(payment);
        } catch (error) {
            this.logger.error("Error updating order:", error);
            throw new BusinessException(error);
        }
    }

    public async getOrderDirect(orderId: string): Promise<{ order: Order, orderItems: OrderItem[] }> {
        try {
            const order = await this.orderRepository.getOrderWithItems(orderId);
            return order;
        } catch (error) {
            this.logger.error("Error Getting Order by OrderId !");
            throw new BusinessException(error);
        }
    }


    public async getOrderDirectByUserId(userId: string): Promise<{ userId: string, orders: Order[] }> {
        try {
            const orders = await this.orderRepository.getOrders(userId);
            return { userId, orders };
        } catch (error) {
            this.logger.error("Error Getting Order by userId !");
            throw new BusinessException(error);
        }
    }
}