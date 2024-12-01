import { ZodError } from "zod";
import { BusinessException, ValidationErrorException } from "../errors/customError";
import { UserOTPGeneration, UserOTPValidation } from "../interfaces/user";
import { UserRepository } from "../repository/user.repository";
import { Logger } from "../utils/logger";
import { InterMessageService } from "./intermessage.service";

export class OTPService {

    private userRepository: UserRepository;
    private messageService: InterMessageService;

    private logger: Logger = Logger.getInstance({
        serviceName: "OTPService", logLevel: "debug"
    })

    constructor() {
        this.userRepository = new UserRepository();
        this.messageService = new InterMessageService();
    }

    public generateOTP(): number {
        const digits = "0123456789";

        let otp = "";

        for (let i = 0; i < length; i++) {
            otp += digits[Math.floor(Math.random() * 10)];
        }

        return parseInt(otp);
    }

    public async sendOTP(userId: string): Promise<Boolean> {
        try {

            if(!userId) {
                throw new BusinessException("Please Provide the UserId to request otp !");
            }
            
            const emailOTP = this.generateOTP();
            const smsOTP = this.generateOTP();

            await this.userRepository.saveOTPCredentials({ userId, emailOTP, smsOTP });
            const { email, phoneNo, firstName, lastName } = await this.userRepository.getUserDetails(userId);

            if (!phoneNo) {
                throw new BusinessException("Please Save the Phone No !");
            }

            await this.messageService.requestOTP({ userId, email, phoneNo, firstName, lastName, emailOTP, smsOTP });

            return true;
        } catch (error) {
            this.handleServiceError(error);
        }
    }

    public async validateOTP(otpDetails: UserOTPValidation): Promise<Boolean> {
        try {

            const { userId, emailOTP, smsOTP } = otpDetails;

            const userDetails = await this.userRepository.getUserDetails(userId);

            if (userDetails.emailOTP === emailOTP && userDetails.smsOTP === smsOTP) {
                return this.userRepository.getVerified(userId);
            }

            return false;
        } catch (error: any) {
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