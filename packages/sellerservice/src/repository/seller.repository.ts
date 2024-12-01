import { Address, Seller } from "@prisma/client";
import prisma from "../config/prisma";
import { DatabaseException, ErrorFetchingSellerDetailsException, SellerCreationFailedException, SellerDeletionNotAllowedException, SellerNotFoundException, SellerUpdateNotAllowedException, ServerErrorException } from "../errors/customError";
import { CreateSellerInput, Pagination, PaginationResponse, UpdateSellerInput } from "../interfaces/seller";

export class SellerRepository {

    constructor() { }

    public async createSeller({ name, email, description, address }: CreateSellerInput): Promise<Seller> {
        try {
            const seller = await prisma.$transaction(async (tx) => {
                const newSeller = await prisma.seller.create({
                    data: {
                        name,
                        email,
                        description,
                        addresses: {
                            create: address ? {
                                street: address.street,
                                city: address.city,
                                state: address.state,
                                country: address.country,
                                postalCode: address.postalCode
                            } : []
                        }
                    }
                });

                return newSeller;
            }, {
                maxWait: 5000,
                timeout: 10000
            });

            return seller;
        } catch (error: any) {

            console.log(error);
            if (error instanceof Error) {
                throw new SellerCreationFailedException(error.message);
            }

            throw new DatabaseException("An unexpected error occurred while creating the seller");
        }
    }

    public async updateSeller({ sellerId, name, email, description }: UpdateSellerInput): Promise<Seller> {
        try {

            const seller = await prisma.seller.findUnique({
                where: { sellerId }
            });

            if (!seller) {
                throw new SellerNotFoundException(`Seller with ID ${sellerId} not found`);
            }

            const updatedSeller = await prisma.seller.update({
                where: { sellerId },
                data: {
                    name: name ?? seller.name,
                    email: email ?? seller.email,
                    description: description ?? seller.description,
                },
                include: {
                    addresses: true
                }
            });

            return updatedSeller;
        } catch (error) {
            if (error instanceof SellerNotFoundException) {
                throw error;
            }

            if (error instanceof Error) {
                throw new SellerUpdateNotAllowedException(error.message);
            }

            throw new DatabaseException("An unexpected error occurred while updating the seller.");
        }
    }

    public async deleteSeller(id: string): Promise<Seller> {
        try {
            const seller = await prisma.seller.findUnique({
                where: { sellerId: id },
            });

            if (!seller) {
                throw new SellerNotFoundException(`Seller with ID ${id} not found`);
            }

            const deleteSeller = await prisma.$transaction(async (tx) => {
                const deletedSeller = await prisma.seller.delete({
                    where: { sellerId: id },
                });

                return deletedSeller;
            });

            return deleteSeller;
        } catch (error: any) {

            if (error instanceof SellerNotFoundException) {
                throw error;
            }

            if (error instanceof Error) {
                throw new SellerDeletionNotAllowedException(error.message);
            }

            throw new DatabaseException("An unexpected error occurred while deleting the seller.");
        }
    }

    public async getSellerById(id: string): Promise<Seller | null> {
        try {
            const seller = await prisma.seller.findUnique({
                where: { sellerId: id },
                include: {
                    addresses: true,
                },
            });

            if (!seller) {
                throw new SellerNotFoundException(`Seller with ID ${id} not found`);
            }

            return seller;
        } catch (error) {

            if (error instanceof SellerNotFoundException) {
                throw error;
            }

            if (error instanceof Error) {
                throw new ErrorFetchingSellerDetailsException(error.message);
            }

            throw new DatabaseException("An unexpected error occurred while fetching seller details.");
        }
    }

    public async getAllSellers({ take, skip }: Pagination): Promise<PaginationResponse> {
        try {

            return await prisma.$transaction(async (tx) => {
                const sellers = await tx.seller.findMany({
                    take,
                    skip,
                    include: {
                        addresses: true,
                    },
                });

                const totalCount = await tx.seller.count();

                return { total: totalCount, sellers }
            });

        } catch (error: any) {

            if (error instanceof Error) {
                throw new ServerErrorException("An unexpected error occurred while fetching all sellers.");
            }

            throw new DatabaseException("An unexpected error occurred.");
        }
    }

    public async getSellerAddresses(sellerId: string): Promise<Address[]> {
        try {
            const addresses = await prisma.address.findMany({
                where: { sellerId },
            });

            if (!addresses) {
                throw new SellerNotFoundException(`No Addresses Seller with ID ${sellerId} found`);
            }

            return addresses;
        } catch (error) {

            if (error instanceof SellerNotFoundException) {
                throw error;
            }

            if (error instanceof Error) {
                throw new ErrorFetchingSellerDetailsException(error.message);
            }

            throw new DatabaseException("An unexpected error occurred while fetching seller's addresses.");
        }
    }

    public async saveOrderId(sellerId: string, orderId: string): Promise<Boolean> {
        try {

            const response = await prisma.seller.update({
                where: { sellerId },
                data: {
                    orderIds: {
                        push: orderId
                    }
                }
            });

            return !!response;
        } catch (error: any) {
            if (error instanceof SellerNotFoundException) {
                throw error;
            }

            if (error instanceof Error) {
                throw new SellerUpdateNotAllowedException(error.message);
            }

            throw new DatabaseException("An unexpected error occurred while updating orderid to the seller.");
        }
    }
}