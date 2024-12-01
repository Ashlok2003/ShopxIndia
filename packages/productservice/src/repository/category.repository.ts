import { DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput, UpdateItemCommand, UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { getClient } from "../config/dynamodb";
import { CategoryNotFoundException, DatabaseException, ValidationErrorException } from "../error/customError";
import { CategoryUpdateInput, DeleteCategoryInput } from "../interfaces/category";
import { Pagination } from "../interfaces/request";
import { PaginationResponse, Response } from "../interfaces/response";
import { Category } from "../models/category";
import { Product } from "../models/product";
import { Logger } from "../utils/logger";

export class CategoryRepository {
    private logger: Logger = Logger.getInstance({ serviceName: "CategoryRepository", logLevel: "debug" });
    private _connection: DynamoDBClient;

    constructor() {
        this._connection = getClient();
    }

    public async createCategory(category: Category): Promise<Response<Category>> {
        try {

            const ddb = this._connection;

            const params: PutItemCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME,
                Item: category.toItem(),
                ConditionExpression: "attribute_not_exists(PK)",
                ReturnValues: "ALL_OLD",
            };

            const command = new PutItemCommand(params);
            const response = await ddb.send(command);
            const categoryDetails = response.Attributes ? unmarshall(response.Attributes) as Category : null;

            /* 
            !   Since PutItemCommand only accept the NONE & ALL_OLD so we can't fetch the newly inserted data
            !   dynamically. So we have to return the data used to insert inside the DynamoDB :)
            !   but it will surely return the updated data :)
            */
            return {
                status: 200,
                data: categoryDetails ?? category
            }
        } catch (error: any) {
            console.log(error);
            this.logger.error("Error while creating the category ::", error);
            throw new DatabaseException("Error while creating the category");
        }
    }

    public async updateCategory(category: CategoryUpdateInput): Promise<Response<Category>> {
        try {
            const ddb = this._connection;

            const updateExpressionParts: string[] = [];
            const expressionAttributeNames: Record<string, string> = {};
            const expressionAttributeValues: Record<string, any> = {};

            Object.keys(category).forEach((field) => {
                if (field !== "categoryId") {
                    updateExpressionParts.push(`#${field} = :${field}`);
                    expressionAttributeNames[`#${field}`] = field;
                    expressionAttributeValues[`:${field}`] = category[field as keyof CategoryUpdateInput];
                }
            });

            if (updateExpressionParts.length === 0) {
                throw new ValidationErrorException("No valid fields to update");
            }

            const updateExpression = `SET ${updateExpressionParts.join(", ")}`;

            const params: UpdateItemCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME,
                Key: marshall({
                    PK: `CATEGORY#${category.categoryId}`,
                    SK: `CATEGORY#${category.categoryName}`,
                }),
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: expressionAttributeNames,
                ExpressionAttributeValues: marshall(expressionAttributeValues),
                ReturnValues: "ALL_NEW",
            };

            const command = new UpdateItemCommand(params);
            await ddb.send(command);

            const getParams: GetItemCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME!,
                Key: marshall({
                    PK: `CATEGORY#${category.categoryId}`,
                    SK: `CATEGORY#${category.categoryName}`,
                }),
            };

            const getResponse = await ddb.send(new GetItemCommand(getParams));
            const item = getResponse.Item;

            if (!item) {
                throw new DatabaseException("Failed to fetch the updated category");
            }

            const updatedCategory = unmarshall(item);

            return {
                status: 200,
                data: updatedCategory as Category
            };

        } catch (error: any) {
            console.log(error);
            this.logger.error("Error while updating the category ::", error);
            throw new DatabaseException("Error while updating the category");
        }
    }

    public async deleteCategory(category: DeleteCategoryInput): Promise<Boolean> {
        try {
            const ddb = this._connection;

            const params: DeleteItemCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME,
                Key: marshall({
                    PK: `CATEGORY#${category.categoryId}`,
                    SK: `CATEGORY#${category.categoryName}`
                }),
                ConditionExpression: "attribute_exists(PK)",
            };

            const comand = new DeleteItemCommand(params);
            const response = await ddb.send(new DeleteItemCommand(params));
            return !!response;
        } catch (error: any) {
            this.logger.error("Error while deleting the category ::", error);
            throw new DatabaseException("Error while deleting the category");
        }
    }

    public async getCategories(pagination: Pagination): Promise<PaginationResponse<Category[]>> {
        try {

            const ddb = this._connection;

            const params: ScanCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME,
                FilterExpression: "begins_with(PK, :prefix)",
                ExpressionAttributeValues: marshall({
                    ":prefix": "CATEGORY#"
                })
            }

            const comand = new ScanCommand(params);
            const response = await ddb.send(comand);

            const categories = response.Items ? response.Items.map(item => unmarshall(item)) as Category[] : [];

            console.log("Categories: ", categories);

            return {
                total: response.Count ?? 0,
                nextToken: JSON.stringify(response.LastEvaluatedKey),
                response: {
                    status: 200,
                    data: categories
                }
            }
        } catch (error: any) {
            this.logger.error("Error while fetching the categories ::", error);
            throw new DatabaseException("Error while fetching the category");
        }
    }

    public async getProductCountByCategory(categoryName: string): Promise<number> {
        try {

            const ddb = this._connection;

            const productCountParams: QueryCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                IndexName: "CATEGORYNAMEINDEX",
                KeyConditionExpression: "categoryName = :categoryName",
                FilterExpression: "begins_with(PK, :prefix)",
                ExpressionAttributeValues: marshall(({
                    ":categoryName": categoryName,
                    ":prefix": "PRODUCT#"
                })),
                Select: "COUNT"
            }

            const productCountResponse = await ddb.send(new QueryCommand(productCountParams));
            return productCountResponse.Count || 0;

        } catch (error: any) {
            this.logger.error("Error while getting the product count by categoryName ::", error);
            throw new DatabaseException("Error while getting the product count by categoryName");
        }
    }

    public async getProductsByCategoryName(categoryName: string, pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            const ddb = this._connection;

            const params: QueryCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME,
                IndexName: "CATEGORYNAMEINDEX",
                KeyConditionExpression: "categoryName = :categoryName",
                ExpressionAttributeValues: marshall(({
                    ":categoryName": categoryName,
                })),
                Limit: pagination.limit,
                ExclusiveStartKey: pagination.nextToken ? marshall(pagination.nextToken) : undefined
            };

            const command = new QueryCommand(params);
            const response = await ddb.send(command);

            if (!response.Items || response.Items.length === 0) {
                throw new CategoryNotFoundException(`Category with name "${categoryName}" does not exist!`);
            }

            let products: Product[] = [];

            response.Items.forEach(item => {
                const unmarshalledItem = unmarshall(item);
                if (unmarshalledItem.PK.startsWith("PRODUCT#")) {
                    products.push(unmarshalledItem as Product);
                }
            });

            return {
                total: products.length,
                response: {
                    status: 200,
                    data: products
                }
            }

        } catch (error: any) {
            this.logger.error("Error Getting Products having category name: ", categoryName);
            throw new DatabaseException("Error Getting Products Starts With Name");
        }
    }

    public async getCategoryByName(categoryName: string): Promise<Category> {
        try {
            const ddb = this._connection;

            const params: QueryCommandInput = {
                TableName: process.env.CATEGORY_TABLE_NAME,
                IndexName: "CATEGORYNAMEINDEX",
                KeyConditionExpression: "categoryName = :categoryName",
                ExpressionAttributeValues: marshall({
                    ":categoryName": categoryName,
                }),
                Limit: 1,
            };

            const command = new QueryCommand(params);
            const response = await ddb.send(command);

            if (!response.Items || response.Items.length === 0) {
                throw new CategoryNotFoundException(`Category with name "${categoryName}" does not exist.`);
            }

            const category = unmarshall(response.Items[0]) as Category;
            return category;

        } catch (error: any) {
            this.logger.error("Error while fetching category details by name:", error);
            throw new DatabaseException("Error while fetching category details by name");
        }
    }

}