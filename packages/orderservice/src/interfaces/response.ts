import { Order } from "@prisma/client";


type SingleOrderData = Order;

type OrderListData = {
    total: number;
    orders: Array<Order>;
}

type SuccessData = SingleOrderData | OrderListData;

type SuccessResponse = {
    status: number;
    data: SuccessData;
}

type ErrorResponse = {
    errorCode: number;
    errorMessage: string;
}


type Response = SuccessResponse | ErrorResponse;

export { SuccessResponse, ErrorResponse, Response, SuccessData, OrderListData };