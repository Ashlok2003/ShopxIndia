import { SNSClient, PublishCommand, PublishCommandInput } from "@aws-sdk/client-sns";
import { Logger } from "../utils/logger";
import { SMSNotSentException } from "../errors/customErrors";
import promiseRetry from "promise-retry";
import { TemplateLoader } from "./templateloader.service";
import { SMSContext } from "../interfaces/notification";

export class SMSService {
    private snsClient: SNSClient;
    private logger: Logger = Logger.getInstance({ serviceName: "smsService", logLevel: "debug" });

    constructor() {
        this.snsClient = new SNSClient({
            region: process.env.AWS_REGION!
        });
    }

    private async sendSMS(phoneNumber: string, message: string): Promise<void> {
        try {
            const params: PublishCommandInput = {
                Message: message,
                PhoneNumber: phoneNumber
            };

            console.log(message);

            const command = new PublishCommand(params);
            // const response = await this.snsClient.send(command);

            //this.logger.info("SMS sent successfully", { messageId: response.MessageId });
        } catch (error: any) {
            this.logger.error("Failed to send SMS", error);
            throw new SMSNotSentException("SMS sending failed");
        }
    }

    public async sendSMSWithRetry(context: SMSContext): Promise<void> {
        const message = await TemplateLoader.renderSMSTemplate(context);

        return promiseRetry(async (retry, number) => {
            try {
                this.logger.info(`Attempt ${number}: Sending SMS to ${context.phoneNumber}`);
                await this.sendSMS(context.phoneNumber, message);
            } catch (error) {

                this.logger.error(`Attempt ${number} failed`, error);

                if (number >= 3) throw error; 

                retry(error);
            }
        })
    }
}
