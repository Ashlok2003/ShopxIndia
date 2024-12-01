import { and, or, rule, shield } from "graphql-shield";
import { validateToken } from "../config/auth";
import { checkPermission } from "../utils/checkPermissions";

const isAuthenticated = rule()(async (parent, args, context) => {
    const authHeader = context.headers;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return false;
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) return false;

    const user = await validateToken(token);
    context.user = user;

    return !!user;
});

const canReadAnyPayment = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:any_payment");
});

const canReadOwnPayment = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:own_payment");
});

const canCreatePayment = rule()((parent, args, { user }) => {
    return checkPermission(user, "create:payment");
});

const canUpdateAnyPayment = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:any_payment");
});

const canUpdateOwnPayment = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:own_payment");
});


const isReadingOwnPayment = rule()((parent, { userId }, { user }) => {
    return user?.sub === userId;
});

const isAdmin = rule()((parent, args, { user }) => {
    return checkPermission(user, "admin");
});

export default shield(
    {
        Query: {
            getPaymentById: or(and(canReadOwnPayment, isReadingOwnPayment), canReadAnyPayment, isAdmin),
            getPaymentByUserId: or(and(canReadOwnPayment, isReadingOwnPayment), canReadAnyPayment),
            getPaymentByStatus: and(isAuthenticated, isAdmin),
            getPaymentByOrderId: or(and(canReadOwnPayment, isReadingOwnPayment), canReadAnyPayment),
        },
        Mutation: {
            validatePayment: and(isAuthenticated, canUpdateOwnPayment),
            cancelPayment: and(isAuthenticated, canUpdateOwnPayment),
            refundPayment: or(and(canUpdateOwnPayment, isReadingOwnPayment), canUpdateAnyPayment, isAdmin),
        },
        Subscription: {
            paymentStatusUpdated: or(and(canReadOwnPayment, isReadingOwnPayment), canReadAnyPayment),
            paymentRefunded: or(and(canReadOwnPayment, isReadingOwnPayment), canReadAnyPayment),
        },
    },
    {
        allowExternalErrors: true,
    }
);
