import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DatabaseException } from "../error/customError";

let client: DynamoDBClient | null = null;

export const getClient = (): DynamoDBClient => {
    if (client) return client;

    try {
        client = process.env.ENVIRONMENT === "PRODUCTION"
            ? new DynamoDBClient({ region: process.env.AWS_REGION })
            : new DynamoDBClient({ endpoint: process.env.DATABASE_URL, region: "us-east-1" });

        return client;
    }
    catch (error: any) {
        throw new DatabaseException(`Unable to connect DynamoDB client :: ${error.message}`);
    }
}