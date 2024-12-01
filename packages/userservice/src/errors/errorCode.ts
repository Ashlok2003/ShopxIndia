export const USER_ERROR_CODES = {
    USER_NOT_FOUND: "USER_NOT_FOUND",
    EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
    PHONE_ALREADY_EXISTS: "PHONE_ALREADY_EXISTS",
    INVALID_USER_DATA: "INVALID_USER_DATA",
    USER_CREATION_FAILED: "USER_CREATION_FAILED",
    USER_UPDATE_NOT_ALLOWED: "USER_UPDATE_NOT_ALLOWED",
    USER_DELETION_NOT_ALLOWED: "USER_DELETION_NOT_ALLOWED",
    UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
    FORBIDDEN_ACCESS: "FORBIDDEN_ACCESS",
    VALIDATION_ERROR: "VALIDATION_ERROR",
    SERVER_ERROR: "SERVER_ERROR",
    DATABASE_EXCEPTION: "DATABASE_EXCEPTION",
    BUSINESS_EXCEPTION: "BUSINESS_EXCEPTION",
    OTP_VERIFICATION_FAILED: "OTP_VERIFICATION_FAILED",

    ADDRESS_NOT_FOUND: "ADDRESS_NOT_FOUND",
    ADDRESS_CREATION_FAILED: "ADDRESS_CREATION_FAILED",
    ADDRESS_UPDATE_FAILED: "ADDRESS_UPDATE_FAILED",
    ADDRESS_DELETION_FAILED: "ADDRESS_DELETION_FAILED",

    SETTINGS_UPDATE_FAILED: "SETTINGS_UPDATE_FAILED",

    CART_NOT_FOUND: "CART_NOT_FOUND",
    CART_CREATION_FAILED: "CART_CREATION_FAILED",
    CART_UPDATE_FAILED: "CART_UPDATE_FAILED",
    CART_DELETION_FAILED: "CART_DELETION_FAILED",
};

export const USER_ERROR_MESSAGES = {
    [USER_ERROR_CODES.USER_NOT_FOUND]: "User with the given ID does not exist.",
    [USER_ERROR_CODES.EMAIL_ALREADY_EXISTS]: "A user with this email address already exists.",
    [USER_ERROR_CODES.PHONE_ALREADY_EXISTS]: "A user with this phone number already exists.",
    [USER_ERROR_CODES.INVALID_USER_DATA]: "The provided user data is invalid. Please check the fields and try again.",
    [USER_ERROR_CODES.USER_CREATION_FAILED]: "An error occurred while trying to create the user. Please try again later.",
    [USER_ERROR_CODES.USER_UPDATE_NOT_ALLOWED]: "You do not have permission to update this user.",
    [USER_ERROR_CODES.USER_DELETION_NOT_ALLOWED]: "User cannot be deleted due to associated constraints.",
    [USER_ERROR_CODES.UNAUTHORIZED_ACCESS]: "User is not authenticated. Please log in to continue.",
    [USER_ERROR_CODES.FORBIDDEN_ACCESS]: "User does not have permission to perform this action.",
    [USER_ERROR_CODES.VALIDATION_ERROR]: "The provided data failed validation. Please ensure all fields are correct.",
    [USER_ERROR_CODES.SERVER_ERROR]: "An unexpected error occurred. Please try again later.",
    [USER_ERROR_CODES.DATABASE_EXCEPTION]: "A database error occurred. Please try again later.",
    [USER_ERROR_CODES.BUSINESS_EXCEPTION]: "A business rule violation occurred. Please review your request.",
    [USER_ERROR_CODES.OTP_VERIFICATION_FAILED]: "The OTP provided is invalid or has expired. Please try again.",

    [USER_ERROR_CODES.ADDRESS_NOT_FOUND]: "The specified address does not exist.",
    [USER_ERROR_CODES.ADDRESS_CREATION_FAILED]: "Failed to create the address. Please try again later.",
    [USER_ERROR_CODES.ADDRESS_UPDATE_FAILED]: "Failed to update the address. Please verify the details and try again.",
    [USER_ERROR_CODES.ADDRESS_DELETION_FAILED]: "Failed to delete the address. Please try again later.",

    [USER_ERROR_CODES.SETTINGS_UPDATE_FAILED]: "Failed to update user settings. Please try again later.",

    [USER_ERROR_CODES.CART_NOT_FOUND]: "The specified cart does not exist.",
    [USER_ERROR_CODES.CART_CREATION_FAILED]: "Failed to create the cart. Please try again later.",
    [USER_ERROR_CODES.CART_UPDATE_FAILED]: "Failed to update the cart. Please verify the details and try again.",
    [USER_ERROR_CODES.CART_DELETION_FAILED]: "Failed to delete the cart. Please try again later.",
};

export const USER_ERROR_STATUS = {
    [USER_ERROR_CODES.USER_NOT_FOUND]: 404,
    [USER_ERROR_CODES.EMAIL_ALREADY_EXISTS]: 409,
    [USER_ERROR_CODES.PHONE_ALREADY_EXISTS]: 409,
    [USER_ERROR_CODES.INVALID_USER_DATA]: 400,
    [USER_ERROR_CODES.USER_CREATION_FAILED]: 500,
    [USER_ERROR_CODES.USER_UPDATE_NOT_ALLOWED]: 403,
    [USER_ERROR_CODES.USER_DELETION_NOT_ALLOWED]: 403,
    [USER_ERROR_CODES.UNAUTHORIZED_ACCESS]: 401,
    [USER_ERROR_CODES.FORBIDDEN_ACCESS]: 403,
    [USER_ERROR_CODES.VALIDATION_ERROR]: 422,
    [USER_ERROR_CODES.SERVER_ERROR]: 500,
    [USER_ERROR_CODES.DATABASE_EXCEPTION]: 500,
    [USER_ERROR_CODES.BUSINESS_EXCEPTION]: 400,
    [USER_ERROR_CODES.OTP_VERIFICATION_FAILED]: 401,

    [USER_ERROR_CODES.ADDRESS_NOT_FOUND]: 404,
    [USER_ERROR_CODES.ADDRESS_CREATION_FAILED]: 500,
    [USER_ERROR_CODES.ADDRESS_UPDATE_FAILED]: 400,
    [USER_ERROR_CODES.ADDRESS_DELETION_FAILED]: 500,

    [USER_ERROR_CODES.SETTINGS_UPDATE_FAILED]: 500,
    [USER_ERROR_CODES.CART_NOT_FOUND]: 404,
    [USER_ERROR_CODES.CART_CREATION_FAILED]: 500,
    [USER_ERROR_CODES.CART_UPDATE_FAILED]: 400,
    [USER_ERROR_CODES.CART_DELETION_FAILED]: 500,
};
