
type Data<T> = T | T[];

interface SuccessResponse<T> {
    status: number;
    data: Data<T> | null | undefined;
}

interface ErrorResponse {
    path?: string;
    errorCode: number;
    statusCode: number;
    timestamp?: string;
    errorMessage: string;
    errors?: Array<{ path?: string | string[]; message: string }>;
}

type Response<T> = SuccessResponse<T> | ErrorResponse;

interface PaginationResponse<T> {
    total: number;
    response: Response<T>;
    nextToken?: Record<string, any> | string;
}

export { Data, ErrorResponse, PaginationResponse, Response, SuccessResponse };
