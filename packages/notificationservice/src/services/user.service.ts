
/*
!   THIS CLASS WILL HANDLE ALL THE PAYMENT CENTRIC INCOMING REQUEST HANDLING :)
*/

import { ServerErrorException } from "../errors/customErrors";
import { MailOptions, SMSContext } from "../interfaces/notification";
import { OTPRequest } from "../interfaces/user";
import { EmailService } from "./email.service";
import { NotificationService } from "./notification.service";
import { SMSService } from "./sms.service";


export class UserService {

    private smsService: SMSService;
    private mailService: EmailService;
    private notificationService: NotificationService;

    constructor() {
        this.smsService = new SMSService();
        this.mailService = new EmailService();
        this.notificationService = new NotificationService();
    }

    public async sendOTP(details: OTPRequest) {
        try {
            const { firstName, lastName, email, emailOTP, smsOTP, userId, phoneNo } = details;

            const otpExpiry = 5; 
            const serviceName = "ShopXIndia"; 
            const supportContact = "support@shopxindia.com"; 
            const currentYear = new Date().getFullYear();

            const mailOptions: MailOptions = {
                context: {
                    userName: `${firstName} ${lastName}`,
                    otp: emailOTP,
                    otpExpiry,
                    supportLink: "https://shopxindia.com/support",
                    year: currentYear

                },
                subject: "Email Verification !",
                template: "userotp",
                to: email
            }

            const smsOptions: SMSContext = {
                phoneNumber: phoneNo,
                otp: smsOTP.toString(),
                serviceName,
                validityPeriod: otpExpiry,
                supportContact
            }

            await this.mailService.sendEmail(mailOptions);
            await this.smsService.sendSMSWithRetry(smsOptions);

            await this.notificationService.createNotification({
                message: "We have successfully send the OTP !",
                userId
            });

        } catch (error: any) {
            throw new ServerErrorException("Error Happen while sending the OTP's");
        }
    }
}