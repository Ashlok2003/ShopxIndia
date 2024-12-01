import * as aws from "@aws-sdk/client-ses";
import { createTransport, Transporter } from "nodemailer";
import { EmailNotSentException } from "../errors/customErrors";
import { MailOptions } from "../interfaces/notification";
import { Logger } from "../utils/logger";
import { TemplateLoader } from "./templateloader.service";

export class EmailService {
    private transporter: Transporter;
    private logger: Logger = Logger.getInstance({ serviceName: "emailService", logLevel: "debug" });

    constructor() {
        this.transporter = this.createTransporter();
    }

    private createTransporter(): Transporter {
        try {

            const sesClient = new aws.SES({
                region: process.env.AWS_REGION!,
                credentials: {
                    accessKeyId: process.env.ACCESS_ID!,
                    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
                },
            });


            return createTransport({
                SES: {
                    ses: sesClient, aws
                }
            });

        } catch (error: any) {
            this.logger.error("Failed to initialize Nodemailer SES transporter", error);
            throw new Error("SES transporter initialization failed");
        }
    }

    async sendEmail(options: MailOptions): Promise<void> {
        try {
            this.logger.info("Preparing email for sending", { to: options.to, subject: options.subject });

            const htmlContent = await TemplateLoader.renderTemplate(options.template, options.context);
            console.log(htmlContent);

            // const info = await this.transporter.sendMail({
            //     from: process.env.FROM_MAIL,
            //     to: options.to,
            //     subject: options.subject,
            //     html: htmlContent
            // });

            // this.logger.info("Email sent successfully", { messageId: info.messageId });
        } catch (error: any) {

            console.log(error);
            this.logger.error("Failed to send email", error);
            throw new EmailNotSentException("Email sending failed. Check logs for details.");
        }
    }
}

