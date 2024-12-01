import { z } from 'zod';

const ProductInputSchema = z.object({
    productId: z.string().optional(),
    productName: z.string().min(1, "Product name is required"),
    description: z.string().min(1, "Description is required"),
    productPrice: z.number().min(0, "Product price must be a positive number"),
    categoryName: z.string().min(1, "Category name is required"),
    availability: z.boolean(),
    discountedPrice: z.number().min(0, "Discounted price must be a positive number"),
    stock: z.number().min(0, "Stock must be a non-negative number"),
    tags: z.array(z.string()).nonempty("Tags cannot be empty"),
    warranty: z.string().min(1, "Warranty is required"),
    brandName: z.string().min(1, "Brand name is required"),
    keyFeatures: z.array(z.string()).optional(),
    sellerId: z.string().min(1, "Seller ID is required"),
    imageUrls: z.array(z.string().url("Each image URL must be valid")),

    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

const ProductInputArraySchema = z.array(ProductInputSchema);

const ProductUpdateInputSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),

    productName: z.string().optional(),
    description: z.string().optional(),
    productPrice: z.number().min(0, "Product price must be a positive number").optional(),
    categoryName: z.string(),
    availability: z.boolean().optional(),
    discountedPrice: z.number().min(0, "Discounted price must be a positive number").optional(),

    stock: z.number().min(0, "Stock must be a non-negative number").optional(),
    tags: z.array(z.string()).optional(),
    warranty: z.string().optional(),
    brandName: z.string().optional(),
    keyFeatures: z.array(z.string()).optional(),

    sellerId: z.string().optional(),
    imageUrls: z.array(z.string().url()).optional(),

    updatedAt: z.date().optional(),
});

const DeleteProductInputSchema = z.object({
    productId: z.string().min(1, { message: "Product ID is required." }),
    categoryName: z.string().min(1, { message: "Category name is required." }),
});

const DeleteProductInputArraySchema = z.array(DeleteProductInputSchema);

const UpdateProductQuantitySchema = z.object({
    productId: z.string().min(1, { message: "Product ID is required." }),
    quantity: z.number().int().nonnegative({ message: "Quantity must be a non-negative integer." }),
});

export { DeleteProductInputArraySchema, DeleteProductInputSchema, ProductInputArraySchema, ProductInputSchema, ProductUpdateInputSchema, UpdateProductQuantitySchema };

