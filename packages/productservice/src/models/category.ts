import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from 'uuid';
import { DatabaseException } from "../error/customError";
import { CategoryInput } from "../interfaces/category";
import { Item } from "../models/base";

export class Category extends Item {

    private imageUrl: string;
    private categoryId: string;
    private categoryName: string;

    private createdAt: Date;
    private updatedAt: Date;

    constructor(categoryInput: CategoryInput) {
        super();

        this.categoryId = categoryInput.categoryId ?? uuid();
        this.categoryName = categoryInput.categoryName;

        this.imageUrl = categoryInput.imageUrl!;

        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    get pk(): string {
        return `CATEGORY#${this.categoryId}`;
    }

    get sk(): string {
        return `CATEGORY#${this.categoryName}`;
    }

    get categoryNameIndex(): string {
        return this.categoryName;
    }

    toItem(): Record<string, AttributeValue> {
        return {
            PK: { S: this.pk },
            SK: { S: this.sk },
            categoryId: { S: this.categoryId },
            categoryName: { S: this.categoryName },
            imageUrl: { S: this.imageUrl },
            createdAt: { S: this.createdAt.toISOString() },
            updatedAt: { S: this.updatedAt.toISOString() },
            categoryNameIndex: { S: this.categoryNameIndex }
        };
    }

    static fromItem(item?: Record<string, AttributeValue>): Category {
        if (!item) throw new DatabaseException("Item cannot be null or undefined.");

        try {

            return new Category({
                categoryName: item.categoryName.S!,
                imageUrl: item.imageUrl.S!,
                categoryId: item.categoryId.S!,
            });

        } catch (error: any) {
            throw new DatabaseException(`Failed to create Category from item: ${error.message}`);
        }
    }
}