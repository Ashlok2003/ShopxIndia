import { BatchGetItemCommand, BatchGetItemCommandInput, BatchWriteItemCommand, BatchWriteItemCommandInput, DeleteItemCommand, DeleteItemCommandInput, DynamoDBClient, ExecuteStatementCommand, ExecuteStatementCommandInput, GetItemCommand, GetItemCommandInput, PutItemCommand, PutItemCommandInput, QueryCommand, QueryCommandInput, ScanCommand, ScanCommandInput, TransactGetItemsCommand, TransactGetItemsCommandInput, UpdateItemCommand, UpdateItemCommandInput, UpdateItemCommandOutput, WriteRequest } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { getClient } from "../config/dynamodb";
import { DatabaseException, ProductDeletionFailedException, ProductNotFoundException, ProductUpdateFailedException, ValidationErrorException } from "../error/customError";
import { DeleteProductInput, ProductUpdateInput, UpdateProductQuantity } from "../interfaces/product";
import { Pagination } from "../interfaces/request";
import { PaginationResponse, Response } from "../interfaces/response";
import { Product } from "../models/product";
import { chunkArray } from "../utils/chunkArray";
import { Logger } from "../utils/logger";

export class ProductRepository {

    private logger: Logger = Logger.getInstance({ serviceName: "ProductRespository", logLevel: "debug" });
    private readonly _connection: DynamoDBClient;

    constructor() {
        this._connection = getClient();
    }

    public async getAllProducts(pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            const ddb = this._connection;

            const params: ScanCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                Limit: pagination.limit,
                ExclusiveStartKey: pagination.nextToken,
                FilterExpression: "begins_with(PK, :prefix)",
                ExpressionAttributeValues: {
                    ":prefix": { S: "PRODUCT#" }
                },
            }

            const command = new ScanCommand(params);
            const response = await ddb.send(command);

            const productData = response.Items ? response.Items.map(item => unmarshall(item) as Product) : [];

            return {
                total: response.Count ?? 0,
                nextToken: JSON.stringify(response.LastEvaluatedKey),
                response: {
                    status: 200,
                    data: productData
                }
            }
        } catch (error: any) {
            this.logger.error("Error Fetching Products List::", error.message);
            throw new DatabaseException("Error While Listing Product !");
        }
    }

    public async getProductByIdDirect(productId: string): Promise<Product | null> {
        try {
            const ddb = this._connection;

            const params: QueryCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: marshall({ ":pk": `PRODUCT#${productId}` }),
                Limit: 1
            };

            const command = new QueryCommand(params);
            const response = await ddb.send(command);

            return response.Items && response.Items.length > 0
                ? unmarshall(response.Items[0]) as Product : null;

        } catch (error: any) {
            this.logger.error("Error Getting Product By ID: ", productId);
            throw new DatabaseException("Error while getting product by ID");
        }
    }

    public async getProductById(productId: string): Promise<Response<Product>> {
        try {
            const ddb = this._connection;

            const params: QueryCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: marshall({ ":pk": `PRODUCT#${productId}` }),
                Limit: 1
            };

            const command = new QueryCommand(params);
            const response = await ddb.send(command);

            return {
                status: 200,
                data: response.Items && response.Items.length > 0
                    ? unmarshall(response.Items[0]) as Product : null,
            }

        } catch (error: any) {
            this.logger.error("Error Getting Product By ID: ", productId);
            throw new DatabaseException("Error while getting product by ID");
        }
    }

    public async getProductsByIds(productIds: string[]): Promise<Product[]> {
        try {
            const ddb = this._connection;

            const products: Product[] = [];

            for (const productId of productIds) {

                const params: QueryCommandInput = {
                    TableName: process.env.PRODUCT_TABLE_NAME as string,
                    KeyConditionExpression: 'PK = :pk',
                    ExpressionAttributeValues: {
                        ':pk': { S: `PRODUCT#${productId}` }
                    },
                    Limit: 1,
                };

                const command = new QueryCommand(params);
                const response = await this._connection.send(command);

                if (response.Items && response.Items.length > 0) {
                    const item = response.Items[0];
                    const product = unmarshall(item) as Product;
                    products.push(product);
                }
            }

            return products;

        } catch (error: any) {
            console.error(error);
            this.logger.error("Error while fetching products by IDs ::", error.message);
            throw new DatabaseException("Error while fetching products by IDs.");
        }
    }

    public async getProductByName(productName: string, pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {

            const ddb = this._connection;

            const params: QueryCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                IndexName: "PRODUCTNAMEINDEX",
                KeyConditionExpression: "productName = :productName",
                ExpressionAttributeValues: marshall({ ":productName": productName }),
                Limit: pagination.limit,
                ExclusiveStartKey: pagination.nextToken ? marshall(pagination.nextToken) : undefined,
            };

            const response = await ddb.send(new QueryCommand(params));
            const products = response.Items ? response.Items.map(item => unmarshall(item) as Product) : []

            return {
                total: response.Count ?? 0,
                nextToken: JSON.stringify(response.LastEvaluatedKey),
                response: {
                    status: 200,
                    data: products
                }
            }
        } catch (error: any) {
            this.logger.error("Error Getting Product By Name: ", productName);
            throw new DatabaseException("Error while getting product by ProductName");
        }
    }

    public async getProductByNameStartsWith(productName: string, pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            const ddb = this._connection;

            const STATEMENT = `
                SELECT * FROM ${process.env.PRODUCT_TABLE_NAME}
                WHERE begins_with(productName, ?) 
            `;

            const params: ExecuteStatementCommandInput = {
                Statement: STATEMENT,
                Parameters: [
                    { S: productName },
                ],
                Limit: pagination.limit,
                ...(pagination.nextToken && typeof pagination.nextToken === "string" && { NextToken: pagination.nextToken })
            }

            const command = new ExecuteStatementCommand(params);
            const response = await ddb.send(command);
            const products = response.Items ? response.Items.map((product) => unmarshall(product) as Product) : [];

            return {
                total: products.length,
                response: {
                    status: 200,
                    data: products
                }
            }
        } catch (error: any) {
            this.logger.error("Error Getting Products Starts With Name: ", productName);
            throw new DatabaseException("Error Getting Products Starts With Name");
        }
    }

    public async createProduct(product: Product): Promise<Response<Product>> {
        try {
            const ddb = this._connection;

            const params: PutItemCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME!,
                Item: product.toItem(),
                ConditionExpression: "attribute_not_exists(PK)",
                ReturnValues: "ALL_OLD"
            };

            const command = new PutItemCommand(params);
            await ddb.send(command);

            return {
                status: 200, data: product
            }

        } catch (error: any) {
            throw new DatabaseException(`Error While Adding Product :: ${error.messages}`);
        }
    }

    public async createProducts(products: Product[]): Promise<PaginationResponse<Product[]>> {
        try {
            const ddb = this._connection;

            const requestItems: Record<string, WriteRequest[]> = {
                [process.env.PRODUCT_TABLE_NAME!]: products.map(product => ({
                    PutRequest: {
                        Item: product.toItem()
                    }
                }))
            };

            const params: BatchWriteItemCommandInput = {
                RequestItems: requestItems
            };

            const command = new BatchWriteItemCommand(params);
            const response = await ddb.send(command);

            const unprocessedItems = response.UnprocessedItems?.[process.env.PRODUCT_TABLE_NAME!] || [];

            const unprocessedProductKeys = unprocessedItems.map((item) => JSON.stringify(item.PutRequest!.Item));

            const unprocessedProducts = products.filter((product) =>
                unprocessedProductKeys.includes(JSON.stringify(product.toItem()))
            );

            const processedProducts = products.filter((product) =>
                !unprocessedProductKeys.includes(JSON.stringify(product.toItem()))
            );

            if (unprocessedProducts.length > 0) {
                this.logger.warn("Some items were not processed: ", unprocessedProducts);
            }

            return {
                total: processedProducts.length,
                response: {
                    status: 200,
                    data: processedProducts,
                }
            }
        } catch (error: any) {
            this.logger.error("Error creating products: ", error);
            throw new DatabaseException("An unexpected error occurred while creating products");
        }
    }

    public async updateProduct(productInput: ProductUpdateInput): Promise<Response<Product>> {
        try {

            if (!productInput.productId || !productInput.categoryName) {
                throw new Error("Product ID is required for updating a product.");
            }

            const categoryName = productInput.categoryName ?? "DEFAULT";

            const params: UpdateItemCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME!,
                Key: marshall({
                    PK: `PRODUCT#${productInput.productId}`,
                    SK: `CATEGORY#${categoryName}`
                }),
                ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
                UpdateExpression: "",
                ExpressionAttributeNames: {},
                ExpressionAttributeValues: {},
                ReturnValues: "ALL_NEW"
            };

            let prefix = "SET ";
            const attributes = Object.keys(productInput) as Array<keyof ProductUpdateInput>;

            for (const attribute of attributes) {
                if (attribute === "productId" || productInput[attribute] === undefined) {
                    continue;
                }

                params.UpdateExpression += `${prefix} #${attribute} = :${attribute}`;
                params.ExpressionAttributeNames![`#${attribute}`] = attribute;

                const value = productInput[attribute];

                params.ExpressionAttributeValues![`:${attribute}`] =
                    typeof value === "string" ? { S: value }
                        : typeof value === "number" ? { N: value.toString() }
                            : typeof value === "boolean" ? { BOOL: value }
                                : value instanceof Date ? { S: value.toISOString() }
                                    : Array.isArray(value) ? { L: value.map((item) => ({ S: item })) }
                                        : value === null ? { NULL: true }
                                            : { S: JSON.stringify(value) };

                prefix = ",";
            }

            params.UpdateExpression += `, #updatedAt = :updatedAt`;
            params.ExpressionAttributeNames!["#updatedAt"] = "updatedAt";
            params.ExpressionAttributeValues![":updatedAt"] = { S: new Date().toISOString() };

            if (!params.UpdateExpression!.startsWith("SET")) {
                throw new ProductUpdateFailedException("No valid attributes provided for update!");
            }

            console.log("Update params: ", params);

            const ddb = this._connection;
            const command = new UpdateItemCommand(params);
            await ddb.send(command);

            const getParams: GetItemCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME!,
                Key: marshall({
                    PK: `PRODUCT#${productInput.productId}`,
                    SK: `CATEGORY#${categoryName}`,
                }),
            };

            const getResponse = await ddb.send(new GetItemCommand(getParams));
            const item = getResponse.Item;

            if (!item) {
                throw new ProductNotFoundException("Product not found after update.");
            }

            const product = unmarshall(item);

            return {
                status: 200,
                data: product as Product
            }

        } catch (error: any) {
            console.log(error);
            this.logger.error("Error updating product:", error);
            throw new DatabaseException("Error while updating the product.");
        }
    }

    public async deleteProduct(product: DeleteProductInput): Promise<Boolean> {
        try {
            const ddb = this._connection;

            const params: DeleteItemCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                Key: marshall({
                    PK: `PRODUCT#${product.productId}`,
                    SK: `CATEGORY#${product.categoryName}`
                })
            };

            const command = new DeleteItemCommand(params);
            const response = await ddb.send(command);

            return !!response;
        } catch (error: any) {
            this.logger.error("Error while deleting product :: ", product.productId);
            throw new ProductDeletionFailedException(`Error While Deleting Product :: ${error.message}`)
        }
    }

    public async deleteProducts(products: DeleteProductInput[]): Promise<Boolean> {
        const ddb = this._connection;
        const chunks = chunkArray(products, 25);

        for (const chunk of chunks) {
            const requestItems = {
                [process.env.PRODUCT_TABLE_NAME!]: chunk.map(product => ({
                    DeleteRequest: {
                        Key: marshall({
                            PK: `PRODUCT#${product.productId}`,
                            SK: `CATEGORY#${product.categoryName}`
                        })
                    }
                }))
            };

            const params: BatchWriteItemCommandInput = {
                RequestItems: requestItems
            };

            try {
                const command = new BatchWriteItemCommand(params);
                const response = await ddb.send(command);
            } catch (error: any) {
                this.logger.error("Error while deleting products");
                throw new ProductDeletionFailedException(`Error While Deleting Products :: ${error.message}`)
            }
        }

        return true;
    }

    public async updateProductQuantity(product: UpdateProductQuantity): Promise<Boolean> {
        try {
            const ddb = this._connection;

            const params: UpdateItemCommandInput = {
                TableName: process.env.PRODUCT_TABLE_NAME,
                Key: marshall({
                    PK: `PRODUCT#${product.productId}`
                }),
                UpdateExpression: "SET #stock = if_not_exists(#stock, :zero) + :quantity",
                ExpressionAttributeNames: {
                    "#stock": "stock"
                },
                ExpressionAttributeValues: marshall({
                    "quantity": product.quantity,
                    ":initial": 0
                }),
                ConditionExpression: "attribute_exists(PK) AND if_not_exists(#stock, :initial) + :quantity >= :initial",
                ReturnValues: "UPDATED_NEW"
            }

            const comand = new UpdateItemCommand(params);
            const result = await ddb.send(comand);

            this.logger.info("Product quantity updated successfully:", result);
            return true;
        } catch (error: any) {
            if (error.name === "ConditionalCheckFailedException") {
                this.logger.error("Failed to update product quantity. Either the product doesn't exist or insufficient stock:", error);
                throw new ProductUpdateFailedException("Wrong Product Details or Insufficient Stock");
            }

            this.logger.error("Error updating product quantity:", error);
            throw new DatabaseException("Error while updating product quantity!");
        }
    }

}