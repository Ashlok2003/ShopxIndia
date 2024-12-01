import { Notification } from "@prisma/client";
import prisma from "../config/prisma";
import { DatabaseException, NotificationCreationFailedException, NotificationNotFoundException, NotificationUpdateFailedException } from "../errors/customErrors";

export class NotificationRepository {

    constructor() { }

    public async createNotification(userId: string, message: string): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    message,
                    read: false,
                },
            });
        } catch (error: any) {
            throw new NotificationCreationFailedException(error.message);
        }
    }

    public async getNotificationsByUser(userId: string, read?: boolean): Promise<Notification[]> {
        try {
            const notifications = await prisma.notification.findMany({
                where: {
                    userId,
                    deletedAt: null,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            if (notifications.length === 0) {
                throw new NotificationNotFoundException(`No notifications found for userId ${userId}`);
            }

            return notifications;
        } catch (error: any) {

            if (error instanceof NotificationNotFoundException) {
                throw error;
            }

            throw new DatabaseException(error.message);
        }
    }

    public async markNotificationAsRead(notificationId: string): Promise<Notification> {
        try {
            const notification = await prisma.notification.update({
                where: { notificationId },
                data: { read: true },
            });

            if (!notification) {
                throw new NotificationNotFoundException(`Notification with id ${notificationId} not found.`);
            }

            return notification;

        } catch (error: any) {
            if (error instanceof NotificationNotFoundException) {
                throw error;
            }
            throw new NotificationUpdateFailedException(error.message);
        }
    }

    public async deleteOldNotifications(thresholdInDays: number = 3): Promise<void> {
        try {

            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - thresholdInDays);

            await prisma.notification.deleteMany({
                where: {
                    read: true,
                    deletedAt: null,
                    createdAt: {
                        lt: dateThreshold
                    }
                }
            });

        } catch (error: any) {
            throw new DatabaseException(error.message);
        }
    }
}