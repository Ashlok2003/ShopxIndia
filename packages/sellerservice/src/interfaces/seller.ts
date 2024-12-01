import { Seller } from "@prisma/client";

interface Pagination {
    skip: number;
    take: number;
}

interface PaginationResponse {
    total: number;
    sellers: Seller[];
}


interface AddNewAddressInput {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}


interface UpdateAddressInput {
    id: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}


interface CreateSellerInput {
    name: string;
    email: string;
    description: string;
    address: AddNewAddressInput
}

interface UpdateSellerInput {
    sellerId: string;
    name?: string;
    email?: string;
    description?: string;
    address?: UpdateAddressInput;
}


export { CreateSellerInput, UpdateSellerInput, PaginationResponse, UpdateAddressInput, AddNewAddressInput, Pagination };