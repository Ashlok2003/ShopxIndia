import { Address, Seller } from "@prisma/client";
import { SellerCreationFailedException, SellerNotFoundException, SellerUpdateNotAllowedException, ValidationErrorException } from "../errors/customError";
import { CreateSellerInput, Pagination, PaginationResponse, UpdateSellerInput } from "../interfaces/seller";
import { SellerRepository } from "../repository/seller.repository";
import { Logger } from "../utils/logger";
import { CreateSellerInputSchema, PaginationInputSchema, UpdateSellerInputSchema } from "../validations/seller.validation";
import { ZodError } from "zod";
import { OrderRequest } from "../interfaces/order";

export class SellerService {
    private logger: Logger;
    private sellerRepository: SellerRepository;

    constructor() {
        this.logger = Logger.getInstance({ serviceName: "sellerService", logLevel: "debug" });
        this.sellerRepository = new SellerRepository();
    }

    async createSeller(input: CreateSellerInput): Promise<Seller> {
        try {

            const validatedInput = CreateSellerInputSchema.parse(input);
            this.logger.info("Validated input for creating seller.");

            const createdSeller = await this.sellerRepository.createSeller(validatedInput);
            this.logger.info("Seller successfully created.");

            return createdSeller;
        } catch (error) {
            if (error instanceof ZodError) {
                this.logger.error("Validation failed for creating seller.", { error });
                throw new ValidationErrorException(`Invalid input for creating seller :: ${error.errors}`);
            }
            this.logger.error("An error occurred while creating the seller.", { error });
            throw new SellerCreationFailedException(error);
        }
    }

    async updateSeller(input: UpdateSellerInput): Promise<Seller> {
        try {

            const validatedInput = UpdateSellerInputSchema.parse(input);
            this.logger.info("Validated input for updating seller.");

            const existingSeller = await this.sellerRepository.getSellerById(validatedInput.sellerId);
            if (!existingSeller) {
                this.logger.warn("Seller not found.", { sellerId: validatedInput.sellerId });
                throw new SellerNotFoundException(`Seller with ID ${validatedInput.sellerId} not found.`);
            }

            const updatedSeller = await this.sellerRepository.updateSeller(validatedInput);
            this.logger.info("Seller successfully updated.");

            return updatedSeller;
        } catch (error: any) {
            if (error instanceof ZodError) {
                this.logger.error("Validation failed for updating seller.", { error });
                throw new ValidationErrorException(`Invalid input for updating seller. ${error.errors}`);
            } else if (error instanceof SellerNotFoundException) {
                this.logger.error("Seller not found during update.", { error });
                throw error;
            }
            this.logger.error("An error occurred while updating the seller.", { error });
            throw new SellerUpdateNotAllowedException(error);
        }
    }

    async getSellerById(sellerId: string): Promise<Seller> {
        try {

            const seller = await this.sellerRepository.getSellerById(sellerId);
            if (!seller) {
                this.logger.warn("Seller not found.", { sellerId });
                throw new SellerNotFoundException(`Seller with ID ${sellerId} not found.`);
            }
            return seller;
        } catch (error) {
            this.logger.error("An error occurred while fetching seller.", { error });
            throw error;
        }
    }

    async deleteSeller(sellerId: string): Promise<Seller> {
        try {
            const seller = await this.getSellerById(sellerId);

            const deletedSeller = await this.sellerRepository.deleteSeller(sellerId);
            this.logger.info("Seller successfully deleted.");

            return deletedSeller;
        } catch (error) {
            this.logger.error("An error occurred while deleting seller.", { error });
            throw error;
        }
    }

    async getAllSellers(input: Pagination): Promise<PaginationResponse> {
        try {

            console.log(input);
            const validatedInput = PaginationInputSchema.parse(input);

            const sellers = await this.sellerRepository.getAllSellers(validatedInput);
            this.logger.info("Fetched all sellers successfully.");

            return sellers;
        } catch (error: any) {

            console.log(error);
            if (error instanceof ZodError) {
                this.logger.error("Validation failed for fetching all sellers.", { error });
                throw new ValidationErrorException(`Invalid input for pagination :: ${error.errors}`);
            }
            this.logger.error("An error occurred while fetching all sellers.", { error });
            throw error;
        }
    }

    async getSellerAddresses(sellerId: string): Promise<Address[]> {
        try {

            const sellerAddresses = await this.sellerRepository.getSellerAddresses(sellerId);
            this.logger.info("Fetched all sellers successfully.");

            return sellerAddresses;
        } catch (error) {
            this.logger.error("An error occurred while fetching all addresses of seller.", { error });
            throw error;
        }
    }

    async saveOrderId({ orderId, sellerId }: OrderRequest): Promise<Boolean> {
        try {

            if (!sellerId || !orderId) {
                throw new ValidationErrorException("Please Provide beneficial details to add orderId !");
            }

            return await this.sellerRepository.saveOrderId(sellerId, orderId);

        } catch (error) {
            if (error instanceof SellerNotFoundException) {
                this.logger.error("Seller not found during update.", { error });
                throw error;
            }

            this.logger.error("An error occurred while updating the seller.", { error });

            throw new SellerUpdateNotAllowedException(error);
        }
    }
}
