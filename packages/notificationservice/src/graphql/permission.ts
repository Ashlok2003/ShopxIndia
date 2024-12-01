import { and, or, rule, shield } from "graphql-shield";
import { validateToken } from "../config/auth";
import { checkPermission } from '../utils/checkPermission';

const isAuthenticated = rule()(async (parent, args, context) => {
    const authHeader = context.headers;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return false;
    }

    const token = context.headers.replace("Bearer ", "");
    if (!token) return false;

    const user = await validateToken(token);
    context.user = user;

    return !!user;
});

const canReadAnyNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:any_notification");
});

const canReadOwnNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:own_notification");
});

const canCreateNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "create:notification");
});

const canUpdateAnyNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:any_notification");
});

const canUpdateOwnNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:own_notification");
});

const canDeleteAnyNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "delete:any_notification");
});

const canDeleteOwnNotification = rule()((parent, args, { user }) => {
    return checkPermission(user, "delete:own_notification");
});

const isAdmin = rule()((parent, args, { user }) => {
    return checkPermission(user, "admin");
});

export default shield({
    Query: {
        getNotificationsByUser: or(and(canReadOwnNotification, canReadOwnNotification), canReadAnyNotification, isAdmin),
    },
    Mutation: {
        markNotificationAsRead: or(canUpdateOwnNotification, canUpdateAnyNotification, isAdmin),
    },
}, {
    allowExternalErrors: true,
});
