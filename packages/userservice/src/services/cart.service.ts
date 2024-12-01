import { CartItem, ShoppingCart } from "@prisma/client";
import { BusinessException, ValidationErrorException } from "../errors/customError";
import { AddCartItemDTO, ClearCartDTO, GetCartDetailsDTO, RemoveCartItemDTO, UpdateCartItemDTO } from "../interfaces/cart";
import { SuccessResponse } from "../interfaces/response";
import { CartRepository } from "../repository/cart.repository";
import { Logger } from "../utils/logger";
import { AddCartItemSchema, ClearCartSchema, GetCartDetailsSchema, RemoveCartItemSchema } from "../validations/cart.validation";
import { ZodError } from "zod";

export class CartService {

    private cartRepository: CartRepository;

    private logger: Logger = Logger.getInstance({
        serviceName: "UserRepository",
        logLevel: "debug"
    });

    constructor() {
        this.cartRepository = new CartRepository();
    }

    public async getCartDetails(input: GetCartDetailsDTO): Promise<SuccessResponse<ShoppingCart>> {
        try {

            GetCartDetailsSchema.parse(input);

            const cart = await this.cartRepository.getCartDetails(input);

            return { status: 200, data: cart };

        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }
            throw new BusinessException(error.message || "Failed to retrieve cart details.");
        }
    }

    public async addItemToCart(cartItemData: AddCartItemDTO): Promise<SuccessResponse<CartItem>> {
        try {

            AddCartItemSchema.parse(cartItemData);
            const newItem = await this.cartRepository.addItemToCart(cartItemData);

            return { status: 201, data: newItem };

        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }
            throw new BusinessException(error.message || "Failed to add item to cart.");
        }
    }

    public async updateItemQuantity(updateData: UpdateCartItemDTO): Promise<SuccessResponse<CartItem>> {
        try {

            const updatedItem = await this.cartRepository.updateItemQuantity(updateData);

            return { status: 200, data: updatedItem };

        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }
            throw new BusinessException(error.message || "Failed to update cart item.");
        }
    }

    public async removeItemFromCart(removeData: RemoveCartItemDTO): Promise<Boolean> {
        try {

            RemoveCartItemSchema.parse(removeData);

            const response = await this.cartRepository.removeItemFromCart(removeData);
            return response;
        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }

            throw new BusinessException(error.message || "Failed to remove cart item.");
        }
    }

    public async clearCart(clearData: ClearCartDTO): Promise<Boolean> {
        try {

            ClearCartSchema.parse(clearData);
            return await this.cartRepository.clearCart(clearData);

        } catch (error: any) {
            if (error instanceof ZodError) {
                throw new ValidationErrorException(error.errors);
            }
            throw new BusinessException(error.message || "Failed to clear the cart.");
        }
    }
}