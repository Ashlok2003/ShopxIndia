import { GraphQLUpload } from "graphql-upload-ts";
import { AddCartItemDTO, ClearCartDTO, GetCartDetailsDTO, RemoveCartItemDTO, UpdateCartItemDTO } from "../interfaces/cart";
import { IFile } from "../interfaces/image";
import { Pagination } from "../interfaces/request";
import { CreateAddressDTO, UpdateAddressDTO, UpdateUserSettingsInput, UserCreateInput, UserOTPValidation, UserUpdateInput } from "../interfaces/user";
import { graphqlErrorHandler } from "../middlewares/errorHandler";
import { CartService } from "../services/cart.service";
import { ImageService } from "../services/image.service";
import { InterMessageService } from "../services/intermessage.service";
import { UserService } from "../services/user.service";
import { Address, CartItem, ShoppingCart, User } from "@prisma/client";
import { ErrorResponse, PaginationResponse, SuccessResponse } from "../interfaces/response";
import { OTPService } from "../services/otp.service";


const otpService = new OTPService();
const userService = new UserService();
const cartService = new CartService();
const imageService = new ImageService();

const resolvers = {

    Upload: GraphQLUpload,

    Query: {
        getUserDetails: graphqlErrorHandler(async (_: any, { userId }: { userId: string }) => {
            return userService.getUserDetails(userId);
        }),

        getCartDetails: graphqlErrorHandler(async (_: any, { input }: { input: GetCartDetailsDTO }) => {
            return cartService.getCartDetails(input);
        }),

        searchUsers: graphqlErrorHandler(async (_: any, { query, pagination }: { query: string, pagination: Pagination }) => {
            return userService.searchUser(query, pagination);
        }),

        getAllUsers: graphqlErrorHandler(async (_: any, { pagination }: { pagination: Pagination }) => {
            return userService.getAllUsers(pagination);
        }),
    },

    Mutation: {
        addItemToCart: graphqlErrorHandler(async (_: any, { input }: { input: AddCartItemDTO }) => {
            return cartService.addItemToCart(input);
        }),

        updateItemQuantity: graphqlErrorHandler(async (_: any, { input }: { input: UpdateCartItemDTO }) => {
            return cartService.updateItemQuantity(input);
        }),

        removeItemFromCart: graphqlErrorHandler(async (_: any, { input }: { input: RemoveCartItemDTO }) => {
            return cartService.removeItemFromCart(input);
        }),

        clearCart: graphqlErrorHandler(async (_: any, { input }: { input: ClearCartDTO }) => {
            return cartService.clearCart(input);
        }),

        createUser: graphqlErrorHandler(async (_: any, { input }: { input: UserCreateInput }) => {
            return userService.createUser(input);
        }),

        updateUser: graphqlErrorHandler(async (_: any, { input }: { input: UserUpdateInput }) => {
            return userService.updateUser(input);
        }),

        requestOTP: graphqlErrorHandler(async (_: any, { userId }: { userId: string }) => {
            return otpService.sendOTP(userId);
        }),

        validateOTP: graphqlErrorHandler(async (_: any, { input }: { input: UserOTPValidation }) => {
            return otpService.validateOTP(input);
        }),

        updateUserSettings: graphqlErrorHandler(async (_: any, { input }: { input: UpdateUserSettingsInput }) => {
            return userService.updateUserSettings(input);
        }),

        addAddress: graphqlErrorHandler(async (_: any, { input }: { input: CreateAddressDTO }) => {
            return userService.addAddress(input);
        }),

        updateAddress: graphqlErrorHandler(async (_: any, { input }: { input: UpdateAddressDTO }) => {
            return userService.updateAddress(input);
        }),

        deleteAddress: graphqlErrorHandler(async (_: any, { addressId }: { addressId: string }) => {
            return userService.deleteAddress(addressId);
        }),

        uploadProfilePic: graphqlErrorHandler(async (_: any, { file }: { file: IFile }) => {
            return imageService.singleUpload(file);
        })

    },

    UserResponse: {
        __resolveType: (obj: SuccessResponse<any> | ErrorResponse) => {
            if ("status" in obj) return "SuccessResponse";
            if ("errorCode" in obj) return "ErrorResponse";
        }
    },


    SuccessResponse: {
        isTypeOf: (obj: SuccessResponse<any>) => "status" in obj && "data" in obj,
    },

    ErrorResponse: {
        isTypeOf: (obj: ErrorResponse) => "errorCode" in obj && "errorMessage" in obj,
    },

    PaginationUserResponse: {
        __resolveType(obj: PaginationResponse<any>) {

            if ("total" in obj && "data" in obj) {

                const data = obj.data;

                if (!!data && "userId" in data[0]) return "UserListResponse";

                if (!!data && "street" in data[0]) return "AddressListResponse";
            }

            return "ErrorResponse";
        }
    },

    DataUser: {
        __resolveType: (obj: SuccessResponse<User | ShoppingCart | CartItem | Address>) => {
            if ("userId" in obj && "firstName" in obj) return "User";

            if ("userId" in obj && "items" in obj) return "ShoppingCart";

            if ("cartId" in obj && "productId" in obj) return "CartItem";

            if ("userId" in obj && "street" in obj) return "Address";

            if ("theme" in obj && "receiveEmails" in obj) return "UserSettings";

            return null;
        }
    },

    User: {
        __resolveReference: graphqlErrorHandler(async (reference: { userId: string }) => {
            return userService.getUserDetailsDirect(reference.userId);
        }),

        addresses: graphqlErrorHandler(async (reference: { userId: string }) => {
            return userService.getAddresses(reference.userId);
        }),

        shoppingCart: graphqlErrorHandler(async (reference: { userId: string }) => {
            return cartService.getCartDetails(reference);
        }),

        orders: (reference: { userId: string }) => {
            return { __typename: "OrdersList", userId: reference.userId };
        },

        payments: (reference: { userId: string }) => {
            return { __typename: "PaymentList", userId: reference.userId }
        },

        notifications: (reference: { userId: string }) => {
            return { __typename: "NotificationList", userId: reference.userId }
        },
    }
}

export default resolvers;