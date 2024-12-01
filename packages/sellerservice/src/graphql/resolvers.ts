import { CreateSellerInput, Pagination, UpdateSellerInput } from "../interfaces/seller";
import { graphqlErrorHandler } from "../middlewares/errorHandler";
import { SellerService } from "../services/seller.service"


const sellerService = new SellerService();

const resolvers = {

    Query: {
        getSellerById: graphqlErrorHandler(async (_: any, { sellerId }: { sellerId: string }) => {
            return sellerService.getSellerById(sellerId);
        }),

        getAllSellers: graphqlErrorHandler(async (_: any, { input }: { input: Pagination }) => {
            return sellerService.getAllSellers(input);
        }),

        getSellerAddresses: graphqlErrorHandler(async (_: any, { sellerId }: { sellerId: string }) => {
            return sellerService.getSellerAddresses(sellerId);
        })
    },

    Mutation: {
        createSeller: graphqlErrorHandler(async (_: any, { input }: { input: CreateSellerInput }) => {
            return sellerService.createSeller(input);
        }),

        updateSeller: graphqlErrorHandler(async (_: any, { input }: { input: UpdateSellerInput }) => {
            return sellerService.updateSeller(input);
        }),

        deleteSeller: graphqlErrorHandler(async (_: any, { id }: { id: string }) => {
            return sellerService.deleteSeller(id);
        }),
    },

    Seller: {
        __resolveReference: graphqlErrorHandler(async (reference: { sellerId: string }) => {
            return sellerService.getSellerById(reference.sellerId);
        }),
    }
}

export default resolvers;