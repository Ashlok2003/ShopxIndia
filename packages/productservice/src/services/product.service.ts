import { BusinessException, ValidationErrorException } from "../error/customError";
import { DeleteProductInput, ProductInput, ProductUpdateInput, UpdateProductQuantity } from "../interfaces/product";
import { Pagination } from "../interfaces/request";
import { PaginationResponse, Response } from "../interfaces/response";
import { Product } from "../models/product";
import { ProductRepository } from "../repository/product.repository";
import { Logger } from "../utils/logger";
import { DeleteProductInputArraySchema, DeleteProductInputSchema, ProductInputArraySchema, ProductInputSchema, ProductUpdateInputSchema } from "../validations/product.validation";
import { PaginationSchema } from "../validations/request.validation";
import { ImageService } from "./image.service";

export class ProductService {

    private readonly productRepository: ProductRepository;
    private readonly logger: Logger = Logger.getInstance({
        serviceName: "ProductService",
        logLevel: "debug",
    });

    constructor() {
        this.productRepository = new ProductRepository();
    }

    public async getAllProducts(pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            PaginationSchema.parse(pagination);
            return await this.productRepository.getAllProducts(pagination);
        } catch (error: any) {
            this.logger.error("Error fetching all products:", error.message);
            throw new ValidationErrorException("Invalid pagination parameters");
        }
    }

    public async getProductByIdDirect(productId: string): Promise<Product> {
        try {
            if (!productId) {
                throw new ValidationErrorException("Product ID is required.");
            }

            const response = await this.productRepository.getProductByIdDirect(productId);

            console.log(response);
            if (!response) {
                throw new ValidationErrorException("Product not found.");
            }

            return response;
        } catch (error: any) {
            this.logger.error("Error fetching product by ID:", error.message);
            throw new BusinessException(`Error fetching product by ID:", ${error.message}`);
        }
    }

    public async getProductById(productId: string): Promise<Response<Product>> {
        try {
            if (!productId) {
                throw new ValidationErrorException("Product ID is required.");
            }

            const product = await this.productRepository.getProductById(productId);

            if (!product) {
                throw new ValidationErrorException("Product not found.");
            }

            return product;
        } catch (error: any) {
            this.logger.error("Error fetching product by ID:", error.message);
            throw new BusinessException(`Error fetching product by ID:", ${error.message}`)
        }
    }

    public async getProductsByIds(productIds: string[]): Promise<Product[]> {
        try {
            if (!Array.isArray(productIds) || productIds.length === 0) {
                throw new ValidationErrorException("Product IDs are required.");
            }

            const products = await this.productRepository.getProductsByIds(productIds);
            return products;
        } catch (error: any) {
            this.logger.error("Error fetching products by IDs:", error.message);
            throw error;
        }
    }

    public async createProduct(productInput: ProductInput): Promise<Response<Product>> {
        try {
            ProductInputSchema.parse(productInput);

            const newProduct = new Product(productInput);
            return await this.productRepository.createProduct(newProduct);
        } catch (error: any) {
            this.logger.error("Error creating product:", error.message);
            throw new BusinessException(`Error creating product: ${error.message}`);
        }
    }

    public async createProducts(productInputs: ProductInput[]): Promise<PaginationResponse<Product[]>> {
        try {
            ProductInputArraySchema.parse(productInputs);

            const newProducts: Product[] = productInputs.map(productInput => new Product(productInput));

            return await this.productRepository.createProducts(newProducts);
        } catch (error: any) {
            this.logger.error("Error creating product:", error.message);
            throw new BusinessException(`Error creating product: ${error.message}`);
        }
    }

    public async updateProduct(productInput: ProductUpdateInput): Promise<Response<Product>> {
        try {
            ProductUpdateInputSchema.parse(productInput);

            const updatedProduct = await this.productRepository.updateProduct(productInput);
            return updatedProduct;
        } catch (error: any) {
            this.logger.error("Error updating product:", error.message);
            throw new BusinessException(`Error updating product: ${error.message}`);
        }
    }

    public async deleteProduct(productInput: DeleteProductInput): Promise<Boolean> {
        try {
            DeleteProductInputSchema.parse(productInput);
            const response = await this.productRepository.deleteProduct(productInput);
            return response;
        } catch (error: any) {
            this.logger.error("Error deleting product:", error.message);
            throw new BusinessException(`Error deleting product: ${error.message}`);
        }
    }

    public async deleteProducts(productInput: DeleteProductInput[]): Promise<Boolean> {
        try {
            DeleteProductInputArraySchema.parse(productInput);
            const response = await this.productRepository.deleteProducts(productInput);
            return response;
        } catch (error: any) {
            this.logger.error("Error deleting products:", error.message);
            throw new BusinessException(`Error deleting products: ${error.message}`);
        }
    }

    public async updateProductQuantity(quantityInput: UpdateProductQuantity): Promise<Boolean> {
        try {
            if (!quantityInput.productId || typeof quantityInput.quantity !== "number") {
                throw new ValidationErrorException("Invalid product quantity input.");
            }

            const response = await this.productRepository.updateProductQuantity(quantityInput);
            return response;
        } catch (error: any) {
            this.logger.error("Error updating product quantity:", error.message);
            throw new BusinessException(`Error updating product quantity: ${error.message}`);
        }
    }

    public async getProductByName(productName: string, pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            PaginationSchema.parse(pagination);

            if (!productName || typeof productName !== "string") {
                throw new ValidationErrorException("Product name is required.");
            }

            return await this.productRepository.getProductByName(productName, pagination);
        } catch (error: any) {
            this.logger.error("Error fetching products by name:", error.message);
            throw new ValidationErrorException("Invalid product name or pagination parameters.");
        }
    }

    public async searchProductsByName(productName: string, pagination: Pagination): Promise<PaginationResponse<Product[]>> {
        try {
            PaginationSchema.parse(pagination);

            if (!productName || typeof productName !== "string") {
                throw new ValidationErrorException("Product name is required.");
            }

            return await this.productRepository.getProductByNameStartsWith(productName, pagination);
        } catch (error: any) {
            this.logger.error("Error searching products by name:", error.message);
            throw new ValidationErrorException("Invalid product name or pagination parameters.");
        }
    }
}