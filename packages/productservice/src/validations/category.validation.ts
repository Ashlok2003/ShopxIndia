import { z } from 'zod';

const CategoryInputSchema = z.object({
    categoryId: z.string().optional(),
    categoryName: z.string().min(1, "Category name is required"),
    imageUrl: z.string().url("Invalid URL").optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

const CategoryUpdateInputSchema = z.object({
    categoryId: z.string().min(1, "Category ID is required"),

    categoryName: z.string(),
    imageUrl: z.string().url("Invalid URL").optional(),
    updatedAt: z.date().optional(),
});

const DeleteCategoryInputSchema = z.object({
    categoryId: z.string().min(1, { message: "Category ID is required." }),
    categoryName: z.string().min(1, { message: "Category name is required." }),
});


export { CategoryInputSchema, CategoryUpdateInputSchema, DeleteCategoryInputSchema };

