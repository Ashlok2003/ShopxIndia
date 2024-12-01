export const SELLER_ERROR_CODES = {
    SELLER_NOT_FOUND: "SELLER_NOT_FOUND",
    INVALID_SELLER_DATA: "INVALID_SELLER_DATA",
    SELLER_CREATION_FAILED: "SELLER_CREATION_FAILED",
    SELLER_UPDATE_NOT_ALLOWED: "SELLER_UPDATE_NOT_ALLOWED",
    SELLER_DELETION_NOT_ALLOWED: "SELLER_DELETION_NOT_ALLOWED",
    UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
    FORBIDDEN_ACCESS: "FORBIDDEN_ACCESS",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    DATABASE_EXCEPTION: "DATABASE_EXCEPTION",
    BUSINESS_EXCEPTION: "BUSINESS_EXCEPTION",
    ERROR_FETCHING_SELLER_DETAILS: "ERROR_FETCHING_SELLER_DETAILS",
};

export const SELLER_ERROR_MESSAGES = {
    [SELLER_ERROR_CODES.SELLER_NOT_FOUND]: "Seller with the given ID does not exist.",
    [SELLER_ERROR_CODES.INVALID_SELLER_DATA]: "The provided seller data is invalid. Please check the fields and try again.",
    [SELLER_ERROR_CODES.SELLER_CREATION_FAILED]: "An error occurred while trying to create the seller. Please try again later.",
    [SELLER_ERROR_CODES.SELLER_UPDATE_NOT_ALLOWED]: "You do not have permission to update this seller.",
    [SELLER_ERROR_CODES.SELLER_DELETION_NOT_ALLOWED]: "Seller cannot be deleted due to associated constraints.",
    [SELLER_ERROR_CODES.UNAUTHORIZED_ACCESS]: "User is not authenticated. Please log in to continue.",
    [SELLER_ERROR_CODES.FORBIDDEN_ACCESS]: "User does not have permission to access this seller.",
    [SELLER_ERROR_CODES.VALIDATION_ERROR]: "The provided data failed validation. Please ensure all fields are correct.",
    [SELLER_ERROR_CODES.SERVER_ERROR]: "An unexpected error occurred. Please try again later.",
    [SELLER_ERROR_CODES.DATABASE_EXCEPTION]: "A database error occurred. Please try again later.",
    [SELLER_ERROR_CODES.BUSINESS_EXCEPTION]: "A business rule violation occurred. Please review your request.",
    [SELLER_ERROR_CODES.ERROR_FETCHING_SELLER_DETAILS]: "An error occurred while fetching seller details. Please try again later.",
};

export const SELLER_ERROR_STATUS = {
    [SELLER_ERROR_CODES.SELLER_NOT_FOUND]: 404,
    [SELLER_ERROR_CODES.INVALID_SELLER_DATA]: 400,
    [SELLER_ERROR_CODES.SELLER_CREATION_FAILED]: 500,
    [SELLER_ERROR_CODES.SELLER_UPDATE_NOT_ALLOWED]: 403,
    [SELLER_ERROR_CODES.SELLER_DELETION_NOT_ALLOWED]: 403,
    [SELLER_ERROR_CODES.UNAUTHORIZED_ACCESS]: 401,
    [SELLER_ERROR_CODES.FORBIDDEN_ACCESS]: 403,
    [SELLER_ERROR_CODES.VALIDATION_ERROR]: 422,
    [SELLER_ERROR_CODES.SERVER_ERROR]: 500,
    [SELLER_ERROR_CODES.DATABASE_EXCEPTION]: 500,
    [SELLER_ERROR_CODES.BUSINESS_EXCEPTION]: 400,
    [SELLER_ERROR_CODES.ERROR_FETCHING_SELLER_DETAILS]: 500,
};