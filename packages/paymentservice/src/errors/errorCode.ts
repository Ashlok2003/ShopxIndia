export const PAYMENT_ERROR_CODES = {
    PAYMENT_NOT_FOUND: "PAYMENT_NOT_FOUND",
    INVALID_PAYMENT_DATA: "INVALID_PAYMENT_DATA",
    PAYMENT_CREATION_FAILED: "PAYMENT_CREATION_FAILED",
    INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE",
    PAYMENT_UPDATE_NOT_ALLOWED: "PAYMENT_UPDATE_NOT_ALLOWED",
    PAYMENT_CANCELLATION_NOT_ALLOWED: "PAYMENT_CANCELLATION_NOT_ALLOWED",
    INVALID_PAYMENT_STATUS_TRANSITION: "INVALID_PAYMENT_STATUS_TRANSITION",
    REFUND_FAILED: "REFUND_FAILED",
    UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
    FORBIDDEN_ACCESS: "FORBIDDEN_ACCESS",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    TRANSACTION_NOT_FOUND: "TRANSACTION_NOT_FOUND",
    DATABASE_EXCEPTION: "DATABASE_EXCEPTION",
    BUSINESS_EXCEPTION: "BUSINESS_EXCEPTION",
    ERROR_FETCHING_PAYMENT_DETAILS: "ERROR_FETCHING_PAYMENT_DETAILS",
};

export const PAYMENT_ERROR_MESSAGES = {
    [PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND]: "Payment with the given ID does not exist.",
    [PAYMENT_ERROR_CODES.INVALID_PAYMENT_DATA]: "The provided payment data is invalid. Please check and try again.",
    [PAYMENT_ERROR_CODES.PAYMENT_CREATION_FAILED]: "An error occurred while creating the payment. Please try again later.",
    [PAYMENT_ERROR_CODES.INSUFFICIENT_BALANCE]: "Insufficient balance to complete the payment.",
    [PAYMENT_ERROR_CODES.PAYMENT_UPDATE_NOT_ALLOWED]: "You are not allowed to update this payment.",
    [PAYMENT_ERROR_CODES.PAYMENT_CANCELLATION_NOT_ALLOWED]: "The payment cannot be cancelled as it has already been processed.",
    [PAYMENT_ERROR_CODES.INVALID_PAYMENT_STATUS_TRANSITION]: "Invalid status transition for the payment.",
    [PAYMENT_ERROR_CODES.REFUND_FAILED]: "The refund process failed. Please try again later.",
    [PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS]: "User is not authenticated. Please log in.",
    [PAYMENT_ERROR_CODES.FORBIDDEN_ACCESS]: "You do not have permission to access this payment.",
    [PAYMENT_ERROR_CODES.VALIDATION_ERROR]: "The provided data failed validation. Please ensure all fields are correct.",
    [PAYMENT_ERROR_CODES.SERVER_ERROR]: "An unexpected server error occurred. Please try again later.",
    [PAYMENT_ERROR_CODES.TRANSACTION_NOT_FOUND]: "The specified transaction ID does not exist.",
    [PAYMENT_ERROR_CODES.DATABASE_EXCEPTION]: "A database error occurred. Please try again later.",
    [PAYMENT_ERROR_CODES.BUSINESS_EXCEPTION]: "A business rule violation occurred. Please review your request.",
    [PAYMENT_ERROR_CODES.ERROR_FETCHING_PAYMENT_DETAILS]: "An error occurred while fetching payment details. Please try again later.",
};

export const PAYMENT_ERROR_STATUS = {
    [PAYMENT_ERROR_CODES.PAYMENT_NOT_FOUND]: 404,
    [PAYMENT_ERROR_CODES.INVALID_PAYMENT_DATA]: 400,
    [PAYMENT_ERROR_CODES.PAYMENT_CREATION_FAILED]: 500,
    [PAYMENT_ERROR_CODES.INSUFFICIENT_BALANCE]: 400,
    [PAYMENT_ERROR_CODES.PAYMENT_UPDATE_NOT_ALLOWED]: 403,
    [PAYMENT_ERROR_CODES.PAYMENT_CANCELLATION_NOT_ALLOWED]: 403,
    [PAYMENT_ERROR_CODES.INVALID_PAYMENT_STATUS_TRANSITION]: 400,
    [PAYMENT_ERROR_CODES.REFUND_FAILED]: 500,
    [PAYMENT_ERROR_CODES.UNAUTHORIZED_ACCESS]: 401,
    [PAYMENT_ERROR_CODES.FORBIDDEN_ACCESS]: 403,
    [PAYMENT_ERROR_CODES.VALIDATION_ERROR]: 422,
    [PAYMENT_ERROR_CODES.SERVER_ERROR]: 500,
    [PAYMENT_ERROR_CODES.TRANSACTION_NOT_FOUND]: 404,
    [PAYMENT_ERROR_CODES.DATABASE_EXCEPTION]: 500,
    [PAYMENT_ERROR_CODES.BUSINESS_EXCEPTION]: 400,
    [PAYMENT_ERROR_CODES.ERROR_FETCHING_PAYMENT_DETAILS]: 500,
};


export const QR_SERVICE_ERROR_CODES = {
    QR_GENERATION_FAILED: "QR_GENERATION_FAILED",
    QR_VALIDATION_FAILED: "QR_VALIDATION_FAILED",
    QR_CODE_EXPIRED: "QR_CODE_EXPIRED",
    QR_CODE_NOT_FOUND: "QR_CODE_NOT_FOUND",
    DATABASE_ERROR: "DATABASE_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
    FORBIDDEN_ACCESS: "FORBIDDEN_ACCESS",
};

export const QR_SERVICE_ERROR_MESSAGES = {
    [QR_SERVICE_ERROR_CODES.QR_GENERATION_FAILED]: "An error occurred while generating the QR code. Please try again later.",
    [QR_SERVICE_ERROR_CODES.QR_VALIDATION_FAILED]: "QR code validation failed. Please ensure the code is correct.",
    [QR_SERVICE_ERROR_CODES.QR_CODE_EXPIRED]: "The QR code has expired. Please generate a new one.",
    [QR_SERVICE_ERROR_CODES.QR_CODE_NOT_FOUND]: "The QR code was not found or has already been used.",
    [QR_SERVICE_ERROR_CODES.DATABASE_ERROR]: "A database error occurred. Please try again later.",
    [QR_SERVICE_ERROR_CODES.SERVER_ERROR]: "An unexpected server error occurred. Please try again later.",
    [QR_SERVICE_ERROR_CODES.UNAUTHORIZED_ACCESS]: "Unauthorized access. Please log in.",
    [QR_SERVICE_ERROR_CODES.FORBIDDEN_ACCESS]: "You do not have permission to access this QR code.",
};


export const QR_SERVICE_ERROR_STATUS = {
    [QR_SERVICE_ERROR_CODES.QR_GENERATION_FAILED]: 500,
    [QR_SERVICE_ERROR_CODES.QR_VALIDATION_FAILED]: 400,
    [QR_SERVICE_ERROR_CODES.QR_CODE_EXPIRED]: 410, // Gone (expired)
    [QR_SERVICE_ERROR_CODES.QR_CODE_NOT_FOUND]: 404,
    [QR_SERVICE_ERROR_CODES.DATABASE_ERROR]: 500,
    [QR_SERVICE_ERROR_CODES.SERVER_ERROR]: 500,
    [QR_SERVICE_ERROR_CODES.UNAUTHORIZED_ACCESS]: 401,
    [QR_SERVICE_ERROR_CODES.FORBIDDEN_ACCESS]: 403,
};
