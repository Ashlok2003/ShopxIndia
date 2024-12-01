import { ZodError } from "zod";
import { CategoryInput, CategoryUpdateInput, DeleteCategoryInput } from "../interfaces/category";
import { PaginationResponse, Response } from "../interfaces/response";
import { Category } from "../models/category";
import { CategoryRepository } from "../repository/category.repository";
import { Logger } from "../utils/logger";
import { CategoryInputSchema, CategoryUpdateInputSchema, DeleteCategoryInputSchema } from "../validations/category.validation";
import { DatabaseException, ValidationErrorException } from "../error/customError";
import { Pagination } from "../interfaces/request";
import { PaginationSchema } from "../validations/request.validation";
import { Product } from "../models/product";
import { ImageService } from "./image.service";


export class CategoryService {

    private readonly categoryRepository: CategoryRepository;
    
    private readonly logger: Logger = Logger.getInstance({
        serviceName: "CategoryService",
        logLevel: "debug"
    });

    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    public async createCategory(categoryInput: CategoryInput): Promise<Response<Category>> {
        try {
            CategoryInputSchema.parse(categoryInput);

            const category = new Category(categoryInput);
            return await this.categoryRepository.createCategory(category);
        } catch (error: any) {
            console.log(error);
            
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }

            this.logger.error("Error creating category:", error.message);
            throw new DatabaseException("Error while creating category");
        }
    }

    public async updateCategory(category: CategoryUpdateInput): Promise<Response<Category>> {
        try {
            CategoryUpdateInputSchema.parse(category);

            return await this.categoryRepository.updateCategory(category);
        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }

            this.logger.error("Error updating category:", error.message);
            throw new DatabaseException("Error while updating category");
        }
    }

    public async deleteCategory(category: DeleteCategoryInput): Promise<Boolean> {
        try {
            DeleteCategoryInputSchema.parse(category);

            return await this.categoryRepository.deleteCategory(category);
        } catch (error: any) {

            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }

            this.logger.error("Error deleting category:", error.message);
            throw new DatabaseException("Error while deleting category");
        }
    }

    public async getCategories(pagination: Pagination): Promise<PaginationResponse<Category[]>> {
        try {
            PaginationSchema.parse(pagination);
            const result = await this.categoryRepository.getCategories(pagination);
            return result;
        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }

            this.logger.error("Error fetching categories:", error.message);
            throw new DatabaseException("Error fetching categories");
        }
    }

    public async getProductCountByCategory(categoryName: string): Promise<number> {
        try {
            if (!categoryName) {
                throw new ValidationErrorException("Category name is required to fetch product count.");
            }

            return await this.categoryRepository.getProductCountByCategory(categoryName);
        } catch (error: any) {
            this.logger.error("Error getting product count by category:", error.message);
            throw new DatabaseException("Error fetching product count by category");
        }
    }

    public async getProductsByCategoryName(categoryName: string, pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            if (!categoryName) {
                throw new ValidationErrorException("Category name is required to fetch products.");
            }

            return await this.categoryRepository.getProductsByCategoryName(categoryName, pagination);
        } catch (error: any) {
            this.logger.error("Error getting products by category:", error.message);
            throw new DatabaseException("Error fetching products by category");
        }
    }

    public async getCategoryByName(categoryName: string): Promise<Category> {
        try {
            if (!categoryName) {
                throw new ValidationErrorException("Category name is required to fetch CategoryDetails.");
            }

            return await this.categoryRepository.getCategoryByName(categoryName);
        } catch (error: any) {
            this.logger.error(`Error getting category details by categoryName:${categoryName} ::`, error.message);
            throw new DatabaseException("Error getting category details by categoryName");
        }
    }
}