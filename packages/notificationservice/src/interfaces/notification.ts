import { z } from "zod";
import { NotificationCreateInput, NotificationGetByUserInput, NotificationMarkAsReadInput } from "../validations/notification.validation";


export type NotificationCreateInputType = z.infer<typeof NotificationCreateInput>;
export type NotificationGetByUserInputType = z.infer<typeof NotificationGetByUserInput>;
export type NotificationMarkAsReadInputType = z.infer<typeof NotificationMarkAsReadInput>;


export interface MailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

export interface SMSContext {
    phoneNumber: string;
    otp?: string;
    serviceName?: string;
    validityPeriod?: number;
    message?: string;
    supportContact?: string;
}