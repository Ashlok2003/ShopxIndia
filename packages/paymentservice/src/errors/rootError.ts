import { GraphQLError } from "graphql";
import { PAYMENT_ERROR_MESSAGES, PAYMENT_ERROR_STATUS } from "./errorCode";

export class GraphQLException extends GraphQLError {
    errorCode: string;
    statusCode: number;
    message: string;
    errors?: any;

    constructor(errorCode: string, errors?: any) {
        const message = PAYMENT_ERROR_MESSAGES[errorCode] || "An unexpected error occurred.";
        const statusCode = PAYMENT_ERROR_STATUS[errorCode] || 500;

        super(message, { extensions: { code: errorCode, statusCode: statusCode, errors: errors } });

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.message = message;
        this.errors = errors;
    }
}
