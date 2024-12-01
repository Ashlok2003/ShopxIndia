interface AddCartItemDTO {
    userId: string;
    productId: string;
    quantity: number;
    productName: string;
    productPrice: number;
    imageUrl?: string | null;
}

interface UpdateCartItemDTO {
    cartItemId: string;
    quantity: number;
}

interface RemoveCartItemDTO {
    cartItemId: string;
}

interface ClearCartDTO {
    userId: string;
}

interface GetCartDetailsDTO {
    userId: string;
}

export { AddCartItemDTO, UpdateCartItemDTO, RemoveCartItemDTO, ClearCartDTO, GetCartDetailsDTO };