import { CartItem, ShoppingCart } from "@prisma/client";
import prisma from "../config/prisma";
import { AddCartItemDTO, ClearCartDTO, GetCartDetailsDTO, RemoveCartItemDTO, UpdateCartItemDTO } from "../interfaces/cart";
import { Logger } from "../utils/logger";
import { BusinessException, CartNotFoundException, DatabaseException } from "../errors/customError";

export class CartRepository {

    private logger: Logger = Logger.getInstance({
        serviceName: "CartRepository",
        logLevel: "debug"
    });

    constructor() { }


    public async getCartDetails({ userId }: GetCartDetailsDTO): Promise<ShoppingCart> {
        try {
            const cart = await prisma.shoppingCart.findUnique({
                where: { userId },
                include: {
                    items: true,
                },
            });

            if (!cart) {
                throw new CartNotFoundException(`Cart for user with ID ${userId} not found.`);
            }

            return cart;
        } catch (error: any) {
            this.logger.error("Error getting cart details: ", error);
            throw new DatabaseException(error.message || "Failed to retrieve cart details.");
        }
    }

    public async addItemToCart({ userId, productId, quantity, productName, productPrice, imageUrl, }: AddCartItemDTO): Promise<CartItem> {
        try {

            let cart = await prisma.shoppingCart.findUnique({
                where: { userId },
            });

            if (!cart) {
                cart = await prisma.shoppingCart.create({
                    data: {
                        userId,
                    },
                });
            }

            const item = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    productName,
                    productPrice,
                    totalPrice: quantity * productPrice,
                    quantity,
                    imageUrl,
                },
            });

            return item;
        } catch (error: any) {
            this.logger.error("Error adding item to cart: ", error);
            throw new BusinessException(error.message || "Failed to add item to cart.");
        }
    }

    public async updateItemQuantity({ cartItemId, quantity }: UpdateCartItemDTO): Promise<CartItem> {
        try {

            const cartItem = await prisma.cartItem.findUnique({
                where: { id: cartItemId },
            });

            if (!cartItem) {
                throw new CartNotFoundException(`Cart item with ID ${cartItemId} not found.`);
            }

            const updatedItem = await prisma.cartItem.update({
                where: { id: cartItemId },
                data: {
                    quantity,
                    totalPrice: quantity * cartItem.productPrice,
                },
            });

            return updatedItem;
        } catch (error: any) {
            this.logger.error("Error updating item quantity: ", error);
            throw new BusinessException(error.message || "Failed to update cart item.");
        }
    }

    public async removeItemFromCart({ cartItemId }: RemoveCartItemDTO): Promise<Boolean> {
        try {

            const cartItem = await prisma.cartItem.findUnique({
                where: { id: cartItemId },
            });

            if (!cartItem) {
                throw new CartNotFoundException(`Cart item with ID ${cartItemId} not found.`);
            }

            const response = await prisma.cartItem.delete({
                where: { id: cartItemId },
            });

            return !!response;

        } catch (error: any) {
            this.logger.error("Error removing item from cart: ", error);
            throw new BusinessException(error.message || "Failed to remove item from cart.");
        }
    }

    public async clearCart({ userId }: ClearCartDTO): Promise<Boolean> {
        try {
            const cart = await prisma.shoppingCart.findUnique({
                where: { userId },
            });

            if (!cart) {
                throw new CartNotFoundException(`Cart for user with ID ${userId} not found.`);
            }

            const response = await prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return !!response;

        } catch (error: any) {
            this.logger.error("Error clearing cart: ", error);
            throw new BusinessException(error.message || "Failed to clear the cart.");
        }
    }
}