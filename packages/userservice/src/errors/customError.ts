import { GraphQLException } from "./rootError";
import { USER_ERROR_CODES } from "./errorCode";

export class UserNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.USER_NOT_FOUND, errors);
    }
}

export class EmailAlreadyExistsException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.EMAIL_ALREADY_EXISTS, errors);
    }
}

export class PhoneAlreadyExistsException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.PHONE_ALREADY_EXISTS, errors);
    }
}

export class InvalidUserDataException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.INVALID_USER_DATA, errors);
    }
}

export class UserCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.USER_CREATION_FAILED, errors);
    }
}

export class UserUpdateNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.USER_UPDATE_NOT_ALLOWED, errors);
    }
}

export class UserDeletionNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.USER_DELETION_NOT_ALLOWED, errors);
    }
}

export class UnauthorizedAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.UNAUTHORIZED_ACCESS, errors);
    }
}

export class ForbiddenAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.FORBIDDEN_ACCESS, errors);
    }
}

export class ValidationErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.VALIDATION_ERROR, errors);
    }
}

export class OTPVerificationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.OTP_VERIFICATION_FAILED, errors);
    }
}

export class ServerErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.SERVER_ERROR, errors);
    }
}

export class DatabaseException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.DATABASE_EXCEPTION, errors);
    }
}

export class BusinessException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.BUSINESS_EXCEPTION, errors);
    }
}

export class AddressNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.ADDRESS_NOT_FOUND, errors);
    }
}

export class AddressCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.ADDRESS_CREATION_FAILED, errors);
    }
}

export class AddressUpdateFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.ADDRESS_UPDATE_FAILED, errors);
    }
}

export class AddressDeletionFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.ADDRESS_DELETION_FAILED, errors);
    }
}

export class UserSettingsUpdateFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.SETTINGS_UPDATE_FAILED, errors);
    }
}

export class CartNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.CART_NOT_FOUND, errors);
    }
}

export class CartCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.CART_CREATION_FAILED, errors);
    }
}

export class CartUpdateFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.CART_UPDATE_FAILED, errors);
    }
}

export class CartDeletionFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(USER_ERROR_CODES.CART_DELETION_FAILED, errors);
    }
}
