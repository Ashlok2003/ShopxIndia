import { z } from "zod";

export const NotificationCreateInput = z.object({
    userId: z.string().min(1, "User ID is required and must be a valid UUID."),
    message: z.string().min(1, "Message must not be empty."),
});

export const NotificationGetByUserInput = z.object({
    userId: z.string().min(1, "User ID is required and must be a valid UUID."),
    read: z.boolean().optional(),
});

export const NotificationMarkAsReadInput = z.object({
    notificationId: z.string().uuid().min(1, "Notification ID is required and must be a valid UUID."),
});

