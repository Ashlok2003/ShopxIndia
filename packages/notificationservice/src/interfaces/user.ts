interface OTPRequest {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    emailOTP: number;
    smsOTP: number;
}

interface Address {
    id: string;
    userId: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: Boolean;
}

interface UserResponse {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    addresses: Address[]
}

export { OTPRequest, UserResponse };