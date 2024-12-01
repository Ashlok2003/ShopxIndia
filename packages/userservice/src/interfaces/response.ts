
type Data<T> = T | []

interface SuccessResponse<T> {
    status: number;
    data: Data<T>
}

interface ErrorResponse {
    errorCode: number;
    errorMessage: string;
}


interface PaginationResponse<T> {
    total: number;
    data: Data<T>;
}

export { Data, SuccessResponse, ErrorResponse, PaginationResponse };