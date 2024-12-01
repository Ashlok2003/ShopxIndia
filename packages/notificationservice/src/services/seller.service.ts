import { ServerErrorException } from "../errors/customErrors";
import { MailOptions } from "../interfaces/notification";
import { LowStockNotificationData } from "../interfaces/seller";
import { EmailService } from "./email.service";

export class SellerService {

    private mailService: EmailService;

    constructor() {
        this.mailService = new EmailService();
    }

    public async sendSellerAckMail(details: LowStockNotificationData) {
        try {

            const { email, inventoryDashboardLink, lowStockProducts, sellerName } = details;

            const year = new Date().getFullYear();
            
            const mailOptions: MailOptions = {
                context: {
                    sellerName,
                    lowStockProducts,
                    inventoryDashboardLink,
                    year
                },
                subject: "Low Product Warning !",
                template: "selleracknowledgement",
                to: email
            }


            await this.mailService.sendEmail(mailOptions);

        } catch (error) {
            throw new ServerErrorException("Error occurred while sending low stock mail to seller !");
        }
    }
}