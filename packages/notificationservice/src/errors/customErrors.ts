import { GraphQLException } from "./rootError";
import { EMAIL_ERROR_CODES, NOTIFICATION_ERROR_CODES, SMS_ERROR_CODES } from "./errorCodes";

export class NotificationNotFoundException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.NOTIFICATION_NOT_FOUND, errors);
    }
}

export class InvalidNotificationDataException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.INVALID_NOTIFICATION_DATA, errors);
    }
}

export class NotificationCreationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.NOTIFICATION_CREATION_FAILED, errors);
    }
}

export class NotificationUpdateFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.NOTIFICATION_UPDATE_FAILED, errors);
    }
}

export class UnauthorizedAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.UNAUTHORIZED_ACCESS, errors);
    }
}

export class ForbiddenAccessException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.FORBIDDEN_ACCESS, errors);
    }
}

export class ServerErrorException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.SERVER_ERROR, errors);
    }
}

export class DatabaseException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.DATABASE_EXCEPTION, errors);
    }
}

export class ErrorFetchingNotificationException extends GraphQLException {
    constructor(errors?: any) {
        super(NOTIFICATION_ERROR_CODES.ERROR_FETCHING_NOTIFICATION, errors);
    }
}


export class EmailNotSentException extends GraphQLException {
    constructor(errors?: any) {
        super(EMAIL_ERROR_CODES.EMAIL_NOT_SENT, errors);
    }
}

export class EmailTemplateRenderFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(EMAIL_ERROR_CODES.TEMPLATE_RENDER_FAILED, errors);
    }
}

export class InvalidEmailAddressException extends GraphQLException {
    constructor(errors?: any) {
        super(EMAIL_ERROR_CODES.INVALID_EMAIL_ADDRESS, errors);
    }
}

export class EmailAuthenticationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(EMAIL_ERROR_CODES.AUTHENTICATION_FAILED, errors);
    }
}

export class EmailServiceUnavailableException extends GraphQLException {
    constructor(errors?: any) {
        super(EMAIL_ERROR_CODES.EMAIL_SERVICE_UNAVAILABLE, errors);
    }
}


export class SMSNotSentException extends GraphQLException {
    constructor(errors?: any) {
        super(SMS_ERROR_CODES.SMS_NOT_SENT, errors);
    }
}

export class SMSTemplateRenderFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(SMS_ERROR_CODES.TEMPLATE_RENDER_FAILED, errors);
    }
}

export class InvalidPhoneNumberException extends GraphQLException {
    constructor(errors?: any) {
        super(SMS_ERROR_CODES.INVALID_PHONE_NUMBER, errors);
    }
}

export class SMSAuthenticationFailedException extends GraphQLException {
    constructor(errors?: any) {
        super(SMS_ERROR_CODES.AUTHENTICATION_FAILED, errors);
    }
}

export class SMSServiceUnavailableException extends GraphQLException {
    constructor(errors?: any) {
        super(SMS_ERROR_CODES.SMS_SERVICE_UNAVAILABLE, errors);
    }
}