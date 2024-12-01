import { GraphQLException } from "./rootError";
import { CATEGORY_ERROR_CODES, PRODUCT_ERROR_CODES } from "./errorCodes";

export class ProductNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND, errors);
    }
}

export class InvalidProductDataException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.INVALID_PRODUCT_DATA, errors);
    }
}

export class ProductCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.PRODUCT_CREATION_FAILED, errors);
    }
}

export class ProductUpdateFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.PRODUCT_UPDATE_FAILED, errors);
    }
}

export class ProductDeletionFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.PRODUCT_DELETION_FAILED, errors);
    }
}

export class InsufficientStockException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.INSUFFICIENT_STOCK, errors);
    }
}

export class DuplicateProductException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.DUPLICATE_PRODUCT, errors);
    }
}

export class UnauthorizedAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.UNAUTHORIZED_ACCESS, errors);
    }
}

export class ForbiddenAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.FORBIDDEN_ACCESS, errors);
    }
}

export class ValidationErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.VALIDATION_ERROR, errors);
    }
}

export class ServerErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.SERVER_ERROR, errors);
    }
}

export class DatabaseException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.DATABASE_EXCEPTION, errors);
    }
}

export class BusinessException extends GraphQLException {
    constructor(errors?: any) {
        super(PRODUCT_ERROR_CODES.BUSINESS_EXCEPTION, errors);
    }
}

export class CategoryNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(CATEGORY_ERROR_CODES.CATEGORY_NOT_FOUND, errors);
    }
}

export class InvalidCategoryDataException extends GraphQLException {
    constructor(errors?: any) {
        super(CATEGORY_ERROR_CODES.INVALID_CATEGORY_DATA, errors);
    }
}

export class CategoryCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(CATEGORY_ERROR_CODES.CATEGORY_CREATION_FAILED, errors);
    }
}

export class CategoryUpdateFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(CATEGORY_ERROR_CODES.CATEGORY_UPDATE_FAILED, errors);
    }
}

export class CategoryDeletionFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(CATEGORY_ERROR_CODES.CATEGORY_DELETION_FAILED, errors);
    }
}

export class DuplicateCategoryException extends GraphQLException {
    constructor(errors?: any) {
        super(CATEGORY_ERROR_CODES.DUPLICATE_CATEGORY, errors);
    }
}
