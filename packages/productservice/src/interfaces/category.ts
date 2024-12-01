
interface CategoryInput {
    categoryId?: string;
    categoryName: string;

    imageUrl: string;

    createdAt?: Date;
    updatedAt?: Date;
}

type CategoryDBInput = Omit<CategoryInput, "imageFile">;

interface CategoryUpdateInput {
    categoryId: string;

    categoryName: string;
    imageUrl?: string;

    updatedAt?: Date;
}

interface DeleteCategoryInput {
    categoryId: string;
    categoryName: string;
}

export { CategoryDBInput, CategoryInput, CategoryUpdateInput, DeleteCategoryInput };
