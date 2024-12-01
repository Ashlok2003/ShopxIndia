import { GraphQLUpload } from "graphql-upload-ts";
import { CategoryInput, CategoryUpdateInput, DeleteCategoryInput } from "../interfaces/category";
import { IFile } from "../interfaces/image";
import { DeleteProductInput, ProductInput, ProductUpdateInput } from "../interfaces/product";
import { Pagination } from "../interfaces/request";
import { Data, ErrorResponse, PaginationResponse, Response, SuccessResponse } from "../interfaces/response";
import { graphqlErrorHandler } from "../middlewares/errorHandler";
import { Product } from "../models/product";
import { CategoryService } from "../services/category.service";
import { ImageService } from "../services/image.service";
import { ProductService } from "../services/product.service";

const productService = new ProductService();
const categoryService = new CategoryService();
const imageService = new ImageService();

const resolvers = {

    Upload: GraphQLUpload,

    Query: {

        getProductById: graphqlErrorHandler(async (_: any, { productId }: { productId: string }) => {
            return productService.getProductById(productId);
        }),

        listProducts: graphqlErrorHandler(async (_: any, { pagination }: { pagination: Pagination }) => {
            return productService.getAllProducts(pagination);
        }),

        getProductsByName: graphqlErrorHandler(async (_: any, { productName, pagination }: { productName: string, pagination: Pagination }) => {
            return productService.getProductByName(productName, pagination);
        }),

        getProductsByCategoryName: graphqlErrorHandler(async (_: any, { categoryName, pagination }: { categoryName: string, pagination: Pagination }) => {
            return categoryService.getProductsByCategoryName(categoryName, pagination);
        }),

        listAllCategories: graphqlErrorHandler(async (_: any, { pagination }: { pagination: Pagination }) => {
            return categoryService.getCategories(pagination);
        }),

        getProductsWhichNameStartsWith: graphqlErrorHandler(async (_: any, { productName, pagination }: { productName: string, pagination: Pagination }) => {
            return productService.searchProductsByName(productName, pagination);
        }),
    },

    Mutation: {

        createProduct: graphqlErrorHandler(async (_: any, { input }: { input: ProductInput }) => {
            return productService.createProduct(input);
        }),

        createProducts: graphqlErrorHandler(async (_: any, { input }: { input: ProductInput[] }) => {
            return productService.createProducts(input);
        }),

        updateProduct: graphqlErrorHandler(async (_: any, { input }: { input: ProductUpdateInput }) => {
            return productService.updateProduct(input);
        }),

        deleteProduct: graphqlErrorHandler(async (_: any, { input }: { input: DeleteProductInput }) => {
            return productService.deleteProduct(input);
        }),

        deleteProducts: graphqlErrorHandler(async (_: any, { input }: { input: DeleteProductInput[] }) => {
            return productService.deleteProducts(input);
        }),

        createCategory: graphqlErrorHandler(async (_: any, { input }: { input: CategoryInput }) => {
            return categoryService.createCategory(input);
        }),

        updateCategory: graphqlErrorHandler(async (_: any, { input }: { input: CategoryUpdateInput }) => {
            return categoryService.updateCategory(input);
        }),

        deleteCategory: graphqlErrorHandler(async (_: any, { input }: { input: DeleteCategoryInput }) => {
            return categoryService.deleteCategory(input);
        }),

        batchUploadImage: graphqlErrorHandler(async (_: any, { files }: { files: IFile[] }) => {
            return imageService.batchUpload(files);
        }),

        singleUploadImage: graphqlErrorHandler(async (_: any, { file }: { file: IFile }) => {
            return imageService.singleUpload(file);
        }),
    },

    ProductData: {
        __resolveType(obj: Data<any>) {
            if ("productId" in obj) return "Product";

            if ("categoryId" in obj) return "Category";

            return null;
        }
    },


    ProductResponse: {
        __resolveType(obj: Response<SuccessResponse<any> | ErrorResponse>) {

            if ("data" in obj && "status" in obj) {
                return "ProductSuccessResponse";
            }

            if ("errorCode" in obj && "errorMessage" in obj) {
                return "ProductErrorResponse";
            }

            return null;
        }
    },

    PaginationProductResponse: {
        isTypeOf: (obj: any) => "total" in obj && "response" in obj,
    },

    PaginationCategoryResponse: {
        isTypeOf: (obj: any) => "total" in obj && "response" in obj,
    },

    PaginationResponse: {

        __resolveType(obj: PaginationResponse<SuccessResponse<Product[]>>) {

            if ("response" in obj && "total" in obj && "status" in obj.response) {

                const data = obj.response.data;

                if (data !== null && data !== undefined && Array.isArray(data)) {

                    if ("productId" in data[0]) return "PaginationProductResponse";

                    if ("categoryId" in data[0]) return "PaginationCategoryResponse";
                }
            }

            return "ErrorResponse";
        }
    },

    ProductSuccessResponse: {
        isTypeOf: (obj: SuccessResponse<any>) => "status" in obj && "data" in obj,
    },

    ProductErrorResponse: {
        isTypeOf: (obj: ErrorResponse) => "errorCode" in obj && "errorMessage" in obj,
    },

    Product: {
        __resolveReference: graphqlErrorHandler(async (reference: { productId: string }) => {
            return productService.getProductByIdDirect(reference.productId);
        }),

        seller: (seller: { sellerId: string }) => {
            return { __typename: "Seller", sellerId: seller.sellerId };
        },

        reviews: (review: { productId: string }) => {
            return { __typename: "Review", productId: review.productId };
        },

        category: graphqlErrorHandler(async (product: Product) => {
            return categoryService.getCategoryByName(product.categoryName);
        })
    }
}

export default resolvers;