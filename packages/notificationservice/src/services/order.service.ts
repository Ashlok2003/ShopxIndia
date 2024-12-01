import { ServerErrorException } from "../errors/customErrors";
import { MailOptions } from "../interfaces/notification";
import { OrderCancellationData, OrderConfirmationData } from "../interfaces/order";
import { UserResponse } from "../interfaces/user";
import { EmailService } from "./email.service";


export class OrderService {

    private mailService: EmailService;

    constructor() {
        this.mailService = new EmailService();
    }

    public async sendOrderConfirmationMail(confirm: OrderConfirmationData, userData: UserResponse) {
        try {

            const { orderDate, orderId, orderItems, orderLink, totalAmount } = confirm;

            const { addresses, email, firstName, lastName, phoneNo, userId } = userData;

            const deliveryDate = new Date().getUTCDate();

            const address = addresses.filter(address => address.isDefault)[0] ?? addresses[0];

            const shippingAddress = `${address.street}, ${address.city} ${address.country} ${address.postalCode}`;

            const year = new Date().getFullYear();

            const mailOptions: MailOptions = {
                context: {
                    userName: `${firstName} ${lastName}`,
                    orderId,
                    orderDate,
                    deliveryDate,
                    shippingAddress,
                    orderItems,
                    totalAmount,
                    orderLink,
                    year
                },
                subject: `Order #${orderId} Placed Successfully !`,
                template: "orderconfirmation",
                to: email
            }

            await this.mailService.sendEmail(mailOptions);
        } catch (error) {
            throw new ServerErrorException("Error while sending order confirmation mail !");
        }
    }

    public async sendOrderCancellationMail(cancel: OrderCancellationData, userData: UserResponse) {
        try {

            const { orderId, reason, supportLink } = cancel;
            const { email, firstName, lastName, phoneNo, userId } = userData;

            const year = new Date().getFullYear();

            const mailOptions: MailOptions = {
                context: {
                    userName: `${firstName} ${lastName}`,
                    orderId,
                    reason,
                    supportLink,
                    year
                },
                subject: `Order #${orderId} Cancelled !`,
                template: "ordercancellation",
                to: email
            }

            await this.mailService.sendEmail(mailOptions);
        } catch (error) {
            throw new ServerErrorException("Error while sending order cancellation mail !");
        }
    }
}