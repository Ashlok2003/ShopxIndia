import { IFile } from "./image";

interface ProductInput {
    productId?: string;

    productName: string;
    description: string;
    productPrice: number;
    categoryName: string;
    availability: boolean;
    discountedPrice: number;

    stock: number;
    tags: string[];
    warranty: string;
    brandName: string;
    keyFeatures: string[];

    sellerId: string;
    imageUrls: string[];

    createdAt?: Date;
    updatedAt?: Date;
}

interface ProductUpdateInput {
    productId: string;

    productName?: string;
    description?: string;
    productPrice?: number;
    categoryName: string;
    availability?: boolean;
    discountedPrice?: number;

    stock?: number;
    tags?: string[];
    warranty?: string;
    brandName?: string;
    keyFeatures?: string[];

    sellerId?: string;
    imageUrls?: string[];

    updatedAt?: Date;
}

interface DeleteProductInput {
    productId: string;
    categoryName: string;
}

interface UpdateProductQuantity {
    productId: string;
    quantity: number;
}

type ProductDBInput = Omit<ProductInput, "imageFiles">;


export { ProductInput, ProductUpdateInput, DeleteProductInput, UpdateProductQuantity, ProductDBInput };
