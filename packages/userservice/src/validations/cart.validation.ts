import { z } from "zod";

const AddCartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    productName: z.string(),
    productPrice: z.number(),
    imageUrl: z.string().optional(),
});

const UpdateCartItemSchema = z.object({
    cartItemId: z.string(),
    quantity: z.number().min(1),
});

const RemoveCartItemSchema = z.object({
    cartItemId: z.string(),
});

const ClearCartSchema = z.object({
    userId: z.string(),
});

const GetCartDetailsSchema = z.object({
    userId: z.string(),
});

export { AddCartItemSchema, UpdateCartItemSchema, RemoveCartItemSchema, ClearCartSchema, GetCartDetailsSchema };