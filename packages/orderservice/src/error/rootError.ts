import { GraphQLError } from "graphql";
import { ORDER_ERROR_MESSAGES, ORDER_ERROR_STATUS } from "./errorCode";

export class GraphQLException extends GraphQLError {
    errorCode: string;
    statusCode: number;
    message: string;
    errors?: any;

    constructor(errorCode: string, errors?: any) {
        const message = ORDER_ERROR_MESSAGES[errorCode] || "An unexpected error occurred.";
        const statusCode = ORDER_ERROR_STATUS[errorCode] || 500;

        super(message, { extensions: { code: errorCode, statusCode: statusCode, errors: errors } });

        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.message = message;
        this.errors = errors;
    }
}
