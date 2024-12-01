import { Notification } from "@prisma/client";
import { DatabaseException, InvalidNotificationDataException, NotificationCreationFailedException, NotificationNotFoundException, NotificationUpdateFailedException } from "../errors/customErrors";
import { NotificationCreateInputType, NotificationGetByUserInputType, NotificationMarkAsReadInputType } from "../interfaces/notification";
import { NotificationRepository } from "../repository/notification.repository";
import { NotificationCreateInput, NotificationGetByUserInput, NotificationMarkAsReadInput } from "../validations/notification.validation";
import { OTPRequest } from "../interfaces/user";

export class NotificationService {

    private repository: NotificationRepository;

    constructor() {
        this.repository = new NotificationRepository();
    }

    public async createNotification(input: NotificationCreateInputType): Promise<void> {
        try {
            const parsedInput = NotificationCreateInput.safeParse(input);

            if (!parsedInput.success) {
                throw new InvalidNotificationDataException(parsedInput.error.message);
            }

            const { userId, message } = parsedInput.data;
            await this.repository.createNotification(userId, message);
        } catch (error: any) {
            throw new NotificationCreationFailedException(error.message);
        }
    }

    public async getNotificationsByUser(input: NotificationGetByUserInputType): Promise<Notification[]> {
        try {
            const parsedInput = NotificationGetByUserInput.safeParse(input);

            if (!parsedInput.success) {
                throw new InvalidNotificationDataException(parsedInput.error.message);
            }

            const { userId, read } = parsedInput.data;
            return await this.repository.getNotificationsByUser(userId, read);
        } catch (error: any) {
            console.log(error);
            if (error instanceof NotificationNotFoundException) {
                throw error;
            }

            throw new DatabaseException(error.message);
        }
    }

    public async markNotificationAsRead(input: NotificationMarkAsReadInputType): Promise<Notification> {
        try {
            const parsedInput = NotificationMarkAsReadInput.safeParse(input);

            if (!parsedInput.success) {
                throw new InvalidNotificationDataException(parsedInput.error.message);
            }

            const { notificationId } = parsedInput.data;
            return await this.repository.markNotificationAsRead(notificationId);
        } catch (error: any) {

            if (error instanceof NotificationNotFoundException) {
                throw error;
            }

            throw new NotificationUpdateFailedException(error.message);
        }
    }

    public async deleteOldNotifications(thresholdInDays: number = 3): Promise<void> {
        try {
            await this.repository.deleteOldNotifications(thresholdInDays);
        } catch (error: any) {
            throw new DatabaseException(error.message);
        }
    }

}