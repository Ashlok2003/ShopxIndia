import { Address, User, UserSettings } from "@prisma/client";
import { CreateAddressDTO, UpdateAddressDTO, UpdateUserSettingsInput, UserCreateInput, UserOTPCredentials, UserUpdateInput } from "../interfaces/user";
import { Logger } from "../utils/logger";
import prisma from "../config/prisma";
import { AddressCreationFailedException, AddressDeletionFailedException, AddressNotFoundException, AddressUpdateFailedException, DatabaseException, UserCreationFailedException, UserNotFoundException, UserSettingsUpdateFailedException } from "../errors/customError";
import { Pagination } from "../interfaces/request";

export class UserRepository {

    private logger: Logger = Logger.getInstance({
        serviceName: "UserRepository",
        logLevel: "debug"
    });

    constructor() { }

    public async saveOTPCredentials(otpDetails: UserOTPCredentials): Promise<Boolean> {
        try {

            const { userId, emailOTP, smsOTP } = otpDetails;
            const response = await prisma.user.update({
                where: {
                    userId
                },
                data: {
                    emailOTP,
                    smsOTP
                }
            });

            return !!response;

        } catch (error: any) {
            this.logger.error("Error saving otp details: ", error);
            throw new DatabaseException(error);
        }
    }

    public async getVerified(userId: string): Promise<Boolean> {
        try {
            const response = await prisma.user.update({
                where: { userId },
                data: {
                    isEmailVerified: true,
                    isPhoneVerified: true
                }
            });

            return !!response;
        } catch (error) {
            this.logger.error("Error verifying user details: ", error);
            throw new DatabaseException(error);
        }
    }

    public async getUserDetails(userId: string): Promise<User> {
        try {
            const user = await prisma.user.findUnique({
                where: { userId },
                include: {
                    addresses: true,
                    settings: true,
                    cart: true
                }
            });

            if (!user) {
                throw new UserNotFoundException(`User with ID ${userId} not found.`);
            }

            return user;
        } catch (error: any) {
            this.logger.error("Error fetching user details: ", error);
            throw new DatabaseException(error);
        }

    }

    public async getAllUsers({ take, skip }: Pagination): Promise<User[]> {
        try {

            const users = await prisma.user.findMany({
                take,
                skip
            });

            return users;
        } catch (error) {
            throw new UserNotFoundException(error);
        }
    }

    public async createUser(userData: UserCreateInput): Promise<User> {
        try {
            const createdUser = await prisma.user.create({
                data: {
                    ...userData
                }
            });

            return createdUser;
        } catch (error: any) {
            this.logger.error("Error creating user: ", error);
            throw new UserCreationFailedException(error);
        }
    }

    public async updateUser(userData: UserUpdateInput): Promise<User> {
        try {

            const { userId, firstName, lastName, email, phoneNo } = userData;

            const updateUser = await prisma.$transaction(async (prisma) => {

                const existingUser = await prisma.user.findUnique({
                    where: {
                        userId: userId
                    }
                });

                if (!existingUser) {
                    throw new UserNotFoundException(`User with ID ${userId} not found.`);
                }

                const updatedUser = await prisma.user.update({
                    where: { userId },
                    data: {
                        ...(firstName && { firstName }),
                        ...(lastName && { lastName }),
                        ...(email && { email }),
                        ...(phoneNo && { phoneNo }),
                    },
                });

                return updatedUser;

            });

            return updateUser;

        } catch (error: any) {
            this.logger.error("Error updating user: ", error);
            throw new UserCreationFailedException(error);
        }
    }

    public async updateUserSettings(userSettingsData: UpdateUserSettingsInput): Promise<UserSettings> {
        const { userId, receiveEmails, receiveSms, theme, notifications } = userSettingsData;

        try {
            const updatedSettings = await prisma.userSettings.upsert({
                where: { userId },
                create: {
                    userId,
                    receiveEmails: receiveEmails ?? true,
                    receiveSms: receiveSms ?? true,
                    theme: theme ?? "LIGHT",
                    notifications: notifications ?? true
                },
                update: {
                    ...(receiveEmails !== undefined && { receiveEmails }),
                    ...(receiveSms !== undefined && { receiveSms }),
                    ...(theme && { theme }),
                    ...(notifications !== undefined && { notifications })
                }
            });

            return updatedSettings;
        } catch (error: any) {
            this.logger.error("Error updating user settings: ", error);
            throw new UserSettingsUpdateFailedException(error);
        }
    }

    public async addAddress(addressInput: CreateAddressDTO): Promise<Address> {
        try {
            const { userId, ...addressData } = addressInput;

            const newAddress = await prisma.address.create({
                data: {
                    userId,
                    ...addressData
                }
            });

            return newAddress;
        } catch (error: any) {
            this.logger.error("Error adding address: ", error);
            throw new AddressCreationFailedException(error);
        }
    }

    public async updateAddress(addressInput: UpdateAddressDTO): Promise<Address> {
        const { addressId, ...addressData } = addressInput;

        try {
            const existingAddress = await prisma.address.findFirst({
                where: { id: addressId }
            });

            if (!existingAddress) {
                throw new AddressNotFoundException("Address not found for the given user.");
            }

            const updatedAddress = await prisma.address.update({
                where: { id: existingAddress.id },
                data: {
                    ...(addressData.street && { street: addressData.street }),
                    ...(addressData.city && { city: addressData.city }),
                    ...(addressData.state && { state: addressData.state }),
                    ...(addressData.country && { country: addressData.country }),
                    ...(addressData.postalCode && { postalCode: addressData.postalCode }),
                    ...(addressData.isDefault !== undefined && { isDefault: addressData.isDefault })
                }
            });

            return updatedAddress;
        } catch (error: any) {
            this.logger.error("Error updating address: ", error);
            throw new AddressUpdateFailedException(error);
        }
    }

    public async deleteAddress(addressId: string): Promise<Boolean> {
        try {
            const deletedAddress = await prisma.address.delete({
                where: { id: addressId }
            });

            return !!deletedAddress;
        } catch (error: any) {
            this.logger.error("Error deleting address: ", error);
            throw new AddressDeletionFailedException(error);
        }
    }

    public async getAddresses(userId: string): Promise<Address[]> {
        try {
            const addresses = await prisma.address.findMany({
                where: {
                    userId
                }
            });

            return addresses;
        } catch (error: any) {
            this.logger.error("Error getting addresses: ", error);
            throw new AddressNotFoundException(error);
        }
    }

    public async searchUserByQueryString(query: string, pagination: Pagination): Promise<User[]> {
        try {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        { firstName: { contains: query, mode: "insensitive" } },
                        { lastName: { contains: query, mode: "insensitive" } },
                        { email: { contains: query, mode: "insensitive" } },
                        { phoneNo: { contains: query, mode: "insensitive" } },
                    ]
                },
            });

            return users;

        } catch (error: any) {
            this.logger.error("No user found with search params !");
            throw new UserNotFoundException(error);
        }
    }
}