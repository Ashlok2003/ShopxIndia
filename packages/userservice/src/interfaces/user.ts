
interface UserCreateInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNo?: string;
}

interface UserOTPGeneration {
    userId: string;
}

interface UserOTPCredentials {
    userId: string;
    emailOTP: number;
    smsOTP: number;
}

interface UserOTPValidation {
    userId: string;
    emailOTP: number;
    smsOTP: number;
}


interface UserUpdateInput {
    userId: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNo?: string;
}

interface UpdateUserSettingsInput {
    userId: string;
    receiveEmails?: boolean;
    receiveSms?: boolean;
    theme?: "LIGHT" | "DARK";
    notifications?: boolean;
}

interface CreateAddressDTO {
    userId: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault?: boolean;
}

interface UpdateAddressDTO {
    addressId: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    isDefault?: boolean;
}

export { UserOTPCredentials, UserOTPGeneration, UserOTPValidation, CreateAddressDTO, UpdateAddressDTO, UpdateUserSettingsInput, UserCreateInput, UserUpdateInput };