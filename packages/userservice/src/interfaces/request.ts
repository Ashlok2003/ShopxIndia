
interface Pagination {
    skip: number;
    take: number;
}

interface OTPRequest {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNo: string;
    emailOTP: number;
    smsOTP: number;
}

export { Pagination, OTPRequest };