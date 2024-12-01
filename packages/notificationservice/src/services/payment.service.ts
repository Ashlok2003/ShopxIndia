import { ServerErrorException } from "../errors/customErrors";
import { MailOptions } from "../interfaces/notification";
import { PaymentRequest } from "../interfaces/payment";
import { UserResponse } from "../interfaces/user";
import { EmailService } from "./email.service";

export class PaymentService {

    private mailService: EmailService;

    constructor() {
        this.mailService = new EmailService();
    }

    public async sendPaymentConfirmationMail(confirm: PaymentRequest, userDetails: UserResponse) {
        try {

            const { amount, orderId, receiptLink } = confirm;
            const { email, firstName, lastName, phoneNo, userId } = userDetails;
            
            const year = new Date().getFullYear();

            const mailOptions: MailOptions = {
                context: {
                    userName: `${firstName} ${lastName}`,
                    orderId,
                    amount,
                    receiptLink,
                    year
                },
                subject: "Payment Success",
                template: "paymentconfirmation",
                to: email
            }

            await this.mailService.sendEmail(mailOptions);
        } catch (error) {
            throw new ServerErrorException("Error happened while sending payment confirmation mail");
        }
    }

    public async sendPaymentCancellationMail(cancel: PaymentRequest, userDetails: UserResponse) {
        try {
            const { amount, orderId, retryPaymentLink, supportLink } = cancel;

            const { email, firstName, lastName, phoneNo, userId } = userDetails;
            
            const year = new Date().getFullYear();
            const mailOptions: MailOptions = {
                context: {
                    userName: `${firstName} ${lastName}`,
                    orderId,
                    amount,
                    retryPaymentLink,
                    supportLink,
                    year
                },
                subject: "Payment Unsuccessfull",
                template: "paymentcancellation",
                to: email
            }

            await this.mailService.sendEmail(mailOptions);
        } catch (error) {
            throw new ServerErrorException("Error happened while sending payment cancellation mail");
        }
    }
}