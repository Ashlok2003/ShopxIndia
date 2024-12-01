import { Order } from "@prisma/client";
import { OrderNotFoundException } from "../error/customError";
import { OrderInput, OrderUpdateInput } from "../interfaces/order";
import { Pagination } from "../interfaces/pagination";
import { ErrorResponse, Response, SuccessData, SuccessResponse } from "../interfaces/response";
import { graphqlErrorHandler } from "../middlewares/errorHandler";
import { OrderService } from "../services/order.service";
import { InterMessageService } from "../services/intermessage.service";

const orderService = new OrderService();
const messageService = new InterMessageService(orderService);
orderService.setInterMessageService(messageService);

const resolvers = {
    Query: {

        getOrder: graphqlErrorHandler(async (_: any, { orderId }: { orderId: string }): Promise<Response> => {
            return orderService.getOrder(orderId);
        }),

        getOrders: graphqlErrorHandler(async (_: any, { userId }: { userId: string }): Promise<Response> => {
            return orderService.getOrdersByUserId(userId);
        }),

        getAllOrders: graphqlErrorHandler(async (_: any, { pagination }: { pagination: Pagination }): Promise<Response> => {
            return orderService.getAllOrders(pagination);
        }),
    },

    Mutation: {
        createOrder: graphqlErrorHandler(async (_: any, { input }: { input: OrderInput }): Promise<Response> => {
            return orderService.createOrder(input);
        }),

        updateOrder: graphqlErrorHandler(async (_: any, { input }: { input: OrderUpdateInput }): Promise<Response> => {
            return orderService.updateOrder(input);
        }),

        cancelOrder: graphqlErrorHandler(async (_: any, { orderId }: { orderId: string }): Promise<Response> => {
            return orderService.cancelOrder(orderId);
        }),
    },

    OrderResponse: {
        __resolveType(obj: Response) {

            if ("status" in obj && "data" in obj) {
                return "SuccessOrderResponse";
            }

            if ("errorCode" in obj && "errorMessage" in obj) {
                return "ErrorOrderResponse ";
            }

            return null;
        }
    },

    SuccessOrderResponse: {
        isTypeOf: (obj: SuccessResponse) => "status" in obj && "data" in obj,
    },

    ErrorOrderResponse: {
        isTypeOf: (obj: ErrorResponse) => "errorCode" in obj && "errorMessage" in obj,
    },


    OrderData: {
        __resolveType(obj: SuccessData) {

            if ("orderId" in obj) {
                return "Order";
            }

            if ("orders" in obj && "total" in obj && Array.isArray(obj.orders)) {
                return "OrderList";
            }

            return null;
        }
    },

    Order: {
        __resolveReference: graphqlErrorHandler(async (reference: { orderId: string }) => {
            const { order } = await orderService.getOrderDirect(reference.orderId);
            return order;
        }),

        user: (user: { userId: string }) => {
            return { __typename: "User", userId: user.userId }
        },

        payment: (payment: { userId: string }) => {
            return { __typename: "Payment", userId: payment.userId }
        }
    },

    OrdersList: {
        __resolveReference: graphqlErrorHandler(async (reference: { userId: string }) => {
            return orderService.getOrderDirectByUserId(reference.userId);
        }),
    },

    OrderItem: {
        product(reference: { productId: string }) {
            return { __typename: "Product", productId: reference.productId }
        }
    }

}


export default resolvers;