import { GraphQLError } from "graphql";
import { PRODUCT_ERROR_MESSAGES, PRODUCT_ERROR_STATUS } from "./errorCodes";

export class GraphQLException extends GraphQLError {
    errorCode: string;
    statusCode: number;
    errors?: any;

    constructor(errorCode: string, errors?: any) {
        const message = PRODUCT_ERROR_MESSAGES[errorCode] || "An unexpected error occurred.";
        const statusCode = PRODUCT_ERROR_STATUS[errorCode] || 500;

        super(message, { extensions: { code: errorCode, statusCode: statusCode, errors: errors } });

        this.errorCode = errorCode;
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
