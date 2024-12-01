import { GraphQLException } from "./rootError";
import { ORDER_ERROR_CODES } from "./errorCode";

export class OrderNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.ORDER_NOT_FOUND, errors);
    }
}

export class InvalidOrderDataException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.INVALID_ORDER_DATA, errors);
    }
}

export class OrderCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.ORDER_CREATION_FAILED, errors);
    }
}

export class InsufficientStockException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.INSUFFICIENT_STOCK, errors);
    }
}

export class OrderUpdateNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.ORDER_UPDATE_NOT_ALLOWED, errors);
    }
}

export class OrderCancellationNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.ORDER_CANCELLATION_NOT_ALLOWED, errors);
    }
}

export class InvalidOrderStatusTransitionException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.INVALID_ORDER_STATUS_TRANSITION, errors);
    }
}

export class PaymentFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.PAYMENT_FAILED, errors);
    }
}

export class UnauthorizedAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.UNAUTHORIZED_ACCESS, errors);
    }
}

export class ForbiddenAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.FORBIDDEN_ACCESS, errors);
    }
}

export class ValidationErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.VALIDATION_ERROR, errors);
    }
}

export class ServerErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.SERVER_ERROR, errors);
    }
}

export class ProductNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.PRODUCT_NOT_FOUND, errors);
    }
}

export class DatabaseException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.DATABASE_EXCEPTION, errors);
    }
}

export class BusinessException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.BUSINESS_EXCEPTION, errors);
    }
}

export class ErrorFetchingOrderDetailsException extends GraphQLException {
    constructor(errors?: any) {
        super(ORDER_ERROR_CODES.ERROR_FETCHING_ORDER_DETAILS, errors);
    }
}
