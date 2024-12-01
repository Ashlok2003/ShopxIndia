import { ZodError } from "zod";
import { GraphQLException } from "../error/rootError";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { ServerErrorException, ValidationErrorException } from "../error/customError";
import { timeStamp } from "console";

export const graphqlErrorHandler = (resolver: Function) => {
    return async (parent: any, args: any, context: any, info: any) => {
        try {
            return await resolver(parent, args, context, info);
        } catch (error) {
            let exception: GraphQLException

            if (error instanceof GraphQLException) {
                exception = error;
            } else if (error instanceof ZodError) {
                exception = new ValidationErrorException(error.errors);
            } else {
                exception = new ServerErrorException({ message: "An unexpected error occured !" });
            }

            throw new GraphQLError(exception.message, {
                extensions: {
                    code: exception.errorCode,
                    statusCode: exception.statusCode || 500,
                    errors: exception.errors || [],
                    timeStamp: new Date().toISOString(),
                    path: info.path?.key,
                }
            })
        }
    }
}

export const formatError = (formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError => {
    if (error instanceof GraphQLError) {
        const originalError = error.extensions?.exception as GraphQLException;
        return {
            message: originalError?.message || formattedError.message,
            extensions: {
                code: originalError?.errorCode || formattedError.extensions?.code,
                statusCode: originalError?.statusCode || 500,
                errors: originalError?.errors || formattedError.extensions?.errors || [],
            },
        }
    }

    return {
        message: "Internal Server Error",
        extensions: {
            code: "INTERNAL_SERVER_ERROR",
            statusCode: 500,
        },
    };
}