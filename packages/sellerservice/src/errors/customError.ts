import { GraphQLException } from "./rootError";
import { SELLER_ERROR_CODES } from "./errorCode";

export class SellerNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.SELLER_NOT_FOUND, errors);
    }
}

export class InvalidSellerDataException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.INVALID_SELLER_DATA, errors);
    }
}

export class SellerCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.SELLER_CREATION_FAILED, errors);
    }
}

export class SellerUpdateNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.SELLER_UPDATE_NOT_ALLOWED, errors);
    }
}

export class SellerDeletionNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.SELLER_DELETION_NOT_ALLOWED, errors);
    }
}

export class UnauthorizedAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.UNAUTHORIZED_ACCESS, errors);
    }
}

export class ForbiddenAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.FORBIDDEN_ACCESS, errors);
    }
}

export class ValidationErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.VALIDATION_ERROR, errors);
    }
}

export class ServerErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.SERVER_ERROR, errors);
    }
}

export class DatabaseException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.DATABASE_EXCEPTION, errors);
    }
}

export class BusinessException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.BUSINESS_EXCEPTION, errors);
    }
}

export class ErrorFetchingSellerDetailsException extends GraphQLException {
    constructor(errors?: any) {
        super(SELLER_ERROR_CODES.ERROR_FETCHING_SELLER_DETAILS, errors);
    }
}
