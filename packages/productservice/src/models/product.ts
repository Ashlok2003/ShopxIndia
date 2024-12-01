import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { v4 as uuid } from 'uuid';
import { DatabaseException } from "../error/customError";
import { ProductDBInput, ProductInput } from "../interfaces/product";
import { Item } from "./base";

export class Product extends Item {

    public productId: string;
    public productName: string;
    public description: string;
    public productPrice: number;
    public categoryName: string;
    public availability: boolean;
    public discountedPrice: number;

    public stock: number;
    public tags: string[];
    public warranty: string;
    public brandName: string;
    public keyFeatures: string[];

    public sellerId: string;
    public imageUrls: string[];

    public createdAt: Date;
    public updatedAt: Date;


    constructor(productInput: ProductInput) {
        super();

        this.productId = productInput.productId ?? uuid();
        this.stock = productInput.stock;
        this.tags = productInput.tags ?? [];
        this.sellerId = productInput.sellerId;
        this.imageUrls = productInput.imageUrls!;
        this.brandName = productInput.brandName;
        this.productName = productInput.productName;
        this.description = productInput.description;
        this.categoryName = productInput.categoryName;
        this.productPrice = productInput.productPrice;
        this.keyFeatures = productInput.keyFeatures ?? [];
        this.warranty = productInput.warranty ?? "1 YEAR",
            this.discountedPrice = productInput.discountedPrice;
        this.availability = productInput.availability ?? true;

        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    get pk(): string {
        return `PRODUCT#${this.productId}`;
    }
    get sk(): string {
        return `CATEGORY#${this.categoryName}`;
    }

    get productNameIndex(): string {
        return this.productName;
    }

    toItem(): Record<string, AttributeValue> {
        return {
            PK: { S: this.pk },
            SK: { S: this.sk },
            productId: { S: this.productId },
            sellerId: { S: this.sellerId },
            stock: { N: this.stock.toFixed(1) },
            productName: { S: this.productName },
            description: { S: this.description },
            categoryName: { S: this.categoryName },
            imageUrls: { L: this.imageUrls.length ? this.imageUrls.map(url => ({ S: url })) : [] },
            productPrice: { N: this.productPrice.toFixed(2) },
            discountedPrice: { N: this.discountedPrice.toFixed(2) },
            warranty: { S: this.warranty },
            brandName: { S: this.brandName },
            tags: { L: this.tags.length ? this.tags.map(tag => ({ S: tag })) : [] },
            keyFeatures: { L: this.keyFeatures.length ? this.keyFeatures.map(feature => ({ S: feature })) : [] },
            availability: { BOOL: this.availability },
            createdAt: { S: this.createdAt.toISOString() },
            updatedAt: { S: this.updatedAt.toISOString() },
            productNameIndex: { S: this.productNameIndex }
        }
    }

    static fromItem(item?: Record<string, AttributeValue>): Product {
        if (!item) throw new Error("Item cannot be null or undefined.");

        try {
            return new Product({
                productId: item.productId.S!,
                productName: item.productName.S!,
                sellerId: item.sellerId.S!,
                description: item.description.S!,
                categoryName: item.categoryName.S!,
                imageUrls: (item.imageUrls.L || []).map((url: AttributeValue) => url.S!),
                productPrice: parseFloat(item.price.N!),
                discountedPrice: parseFloat(item.discountedPrice.N!),
                stock: parseInt(item.stock.N!, 10),
                warranty: item.warranty.S!,
                brandName: item.brandName.S!,
                keyFeatures: (item.keyFeatures.L || []).map((feature: AttributeValue) => feature.S!),
                tags: (item.tags.L || []).map((tag: AttributeValue) => tag.S!),
                availability: item.availability.BOOL!,
                createdAt: new Date(item.createdAt.S!),
                updatedAt: new Date(item.updatedAt.S!),
            });
        } catch (error: any) {
            throw new DatabaseException(`Failed to create Product from item: ${error.message}`)
        }
    }
}