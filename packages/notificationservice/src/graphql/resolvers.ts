import { graphqlErrorHandler } from "../middlewares/errorHandler";
import { NotificationService } from "../services/notification.service";

const service = new NotificationService();

const resolvers = {

    Query: {
        getNotificationsByUser: graphqlErrorHandler(async (_: any, { userId }: { userId: string }) => {
            return service.getNotificationsByUser({ userId });
        }),
    },

    Mutation: {
        markNotificationAsRead: graphqlErrorHandler(async (_: any, { notificationId }: { notificationId: string }) => {
            return service.markNotificationAsRead({ notificationId });
        }),
    },

    Notification: {
        __resolverReference: graphqlErrorHandler(async (references: { userId: string }) => {
            return service.getNotificationsByUser({ userId: references.userId });
        }),

        user: (user: { userId: string }) => {
            return { __typename: "User", userId: user.userId };
        }
    },

    NotificationList: {
        __resolverReference: graphqlErrorHandler(async (references: { userId: string }) => {
            return service.getNotificationsByUser({ userId: references.userId });
        }),
    }
}


export default resolvers;