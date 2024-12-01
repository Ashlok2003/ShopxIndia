import { GraphQLException } from "./rootError";
import { PAYMENT_ERROR_CODES, QR_SERVICE_ERROR_CODES } from "./errorCode";

export class PaymentNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND, errors);
    }
}

export class InvalidPaymentDataException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.INVALID_PAYMENT_DATA, errors);
    }
}

export class PaymentCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.PAYMENT_CREATION_FAILED, errors);
    }
}

export class InsufficientBalanceException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.INSUFFICIENT_BALANCE, errors);
    }
}

export class PaymentUpdateNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.PAYMENT_UPDATE_NOT_ALLOWED, errors);
    }
}

export class PaymentCancellationNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.PAYMENT_CANCELLATION_NOT_ALLOWED, errors);
    }
}

export class PaymentRefundNotAllowedException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.PAYMENT_UPDATE_NOT_ALLOWED, errors);
    }
}

export class InvalidPaymentStatusTransitionException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.INVALID_PAYMENT_STATUS_TRANSITION, errors);
    }
}

export class RefundFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.REFUND_FAILED, errors);
    }
}

export class UnauthorizedAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS, errors);
    }
}

export class ForbiddenAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.FORBIDDEN_ACCESS, errors);
    }
}

export class ValidationErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.VALIDATION_ERROR, errors);
    }
}

export class ServerErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.SERVER_ERROR, errors);
    }
}

export class TransactionNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.TRANSACTION_NOT_FOUND, errors);
    }
}

export class DatabaseException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.DATABASE_EXCEPTION, errors);
    }
}

export class BusinessException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.BUSINESS_EXCEPTION, errors);
    }
}

export class ErrorFetchingPaymentDetailsException extends GraphQLException {
    constructor(errors?: any) {
        super(PAYMENT_ERROR_CODES.ERROR_FETCHING_PAYMENT_DETAILS, errors);
    }
}

export class QRServiceException extends GraphQLException {
    constructor(errorCode: string, errors?: any) {
        super(errorCode, errors);
    }
}

export class QRCodeGenerationException extends QRServiceException {
    constructor(errors?: any) {
        super(QR_SERVICE_ERROR_CODES.QR_GENERATION_FAILED, errors);
    }
}

export class QRCodeValidationException extends QRServiceException {
    constructor(errors?: any) {
        super(QR_SERVICE_ERROR_CODES.QR_VALIDATION_FAILED, errors);
    }
}

export class QRCodeExpiredException extends QRServiceException {
    constructor(errors?: any) {
        super(QR_SERVICE_ERROR_CODES.QR_CODE_EXPIRED, errors);
    }
}

export class QRCodeNotFoundException extends QRServiceException {
    constructor(errors?: any) {
        super(QR_SERVICE_ERROR_CODES.QR_CODE_NOT_FOUND, errors);
    }
}


