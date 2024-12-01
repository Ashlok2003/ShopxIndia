import { Address, User, UserSettings } from "@prisma/client";
import { ZodError } from "zod";
import { BusinessException, ValidationErrorException } from "../errors/customError";
import { Pagination } from "../interfaces/request";
import { PaginationResponse, SuccessResponse } from "../interfaces/response";
import { CreateAddressDTO, UpdateAddressDTO, UpdateUserSettingsInput, UserCreateInput, UserUpdateInput } from "../interfaces/user";
import { UserRepository } from "../repository/user.repository";
import { Logger } from "../utils/logger";
import { PaginationSchema } from "../validations/request.validation";
import { CreateAddressDTOSchema, UpdateAddressDTOSchema, UpdateUserSettingsSchema, UserCreateInputSchema, UserUpdateInputSchema } from "../validations/user.validation";

export class UserService {

    private userRepository: UserRepository;
    
    private logger: Logger = Logger.getInstance({
        serviceName: "UserRepository",
        logLevel: "debug"
    });

    constructor() {
        this.userRepository = new UserRepository();
    }

    public async getUserDetailsDirect(userId: string) : Promise<User> {
        try{
            if (!userId) {
                throw new BusinessException("Please Provide the UserId !");
            }

            const user = await this.userRepository.getUserDetails(userId);
            return user;
            
        }catch(error: any) {
            this.handleServiceError(error);
        }
    }

    public async getUserDetails(userId: string): Promise<SuccessResponse<User>> {
        try {
            if (!userId) {
                throw new BusinessException("Please Provide the UserId !");
            }

            const user = await this.userRepository.getUserDetails(userId);
            return { status: 200, data: user };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async getAllUsers(pagination: Pagination): Promise<PaginationResponse<User[]>> {
        try {
            PaginationSchema.parse(pagination);

            const users = await this.userRepository.getAllUsers(pagination);
            return { total: users.length, data: users };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async searchUser(query: string, pagination: Pagination): Promise<PaginationResponse<User[]>> {
        try {

            if (!query) {
                throw new BusinessException("Please provide the query string !");
            }

            PaginationSchema.parse(pagination);

            const users = await this.userRepository.searchUserByQueryString(query, pagination);
            return { total: users.length, data: users };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async createUser(userData: UserCreateInput): Promise<SuccessResponse<User>> {
        try {
            const validatedData = UserCreateInputSchema.parse(userData);
            const createdUser = await this.userRepository.createUser(validatedData);
            return { status: 201, data: createdUser };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async updateUser(userData: UserUpdateInput): Promise<SuccessResponse<User>> {
        try {
            const validatedData = UserUpdateInputSchema.parse(userData);
            const updatedUser = await this.userRepository.updateUser(validatedData);
            return { status: 200, data: updatedUser };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async updateUserSettings(settingsData: UpdateUserSettingsInput): Promise<SuccessResponse<UserSettings>> {
        try {
            const validatedData = UpdateUserSettingsSchema.parse(settingsData);
            const updatedSettings = await this.userRepository.updateUserSettings(validatedData);
            return { status: 200, data: updatedSettings };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async getAddresses(userId: string): Promise<Address[]> {
        try {
            if (!userId) {
                throw new BusinessException("Please Provide the UserId !");
            }

            const addresses = await this.userRepository.getAddresses(userId);
            return addresses;
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async addAddress(addressData: CreateAddressDTO): Promise<SuccessResponse<Address>> {
        try {
            const validatedData = CreateAddressDTOSchema.parse(addressData);
            const createdAddress = await this.userRepository.addAddress(validatedData);
            return { status: 201, data: createdAddress };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async updateAddress(addressData: UpdateAddressDTO): Promise<SuccessResponse<Address>> {
        try {
            UpdateAddressDTOSchema.parse(addressData);
            const updatedAddress = await this.userRepository.updateAddress(addressData);
            return { status: 200, data: updatedAddress };
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async deleteAddress(addressId: string): Promise<Boolean> {
        try {
            if (!addressId) {
                throw new BusinessException("Please provide a valid Address ID.");
            }

            const isDeleted = await this.userRepository.deleteAddress(addressId);
            return isDeleted;
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    private handleServiceError(error: any): never {
        this.logger.error("Service Error: ", error);

        if (error instanceof ZodError) {
            throw new ValidationErrorException(error.errors);
        }

        throw new BusinessException(error);

    }

}