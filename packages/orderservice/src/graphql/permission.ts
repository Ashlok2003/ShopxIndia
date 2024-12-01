import { and, or, rule, shield } from "graphql-shield";
import { validateToken } from "../config/auth";
import { checkPermission } from '../utils/checkPermissions';

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

const canReadAnyOrder = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:any_order");
});

const canReadOwnOrder = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:own_order");
});

const canCreateOrder = rule()((parent, args, { user }) => {
    console.log(checkPermission(user, "create:order"));
    return checkPermission(user, "create:order");
});

const canUpdateAnyOrder = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:any_order");
});

const canUpdateOwnOrder = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:own_order");
});

const isReadingOwnOrder = rule()((parent, { id }, { user }) => {
    return user?.sub === id;
});

const isAdmin = rule()((parent, args, { user }) => {
    return checkPermission(user, "admin");
});

export default shield({
    Query: {
        getOrders: or(and(canReadOwnOrder, isReadingOwnOrder), canReadAnyOrder),
        getOrder: or(and(canReadOwnOrder, isReadingOwnOrder), canReadAnyOrder),
        getAllOrders: and(isAuthenticated, isAdmin),
    },
    Mutation: {
        createOrder: and(isAuthenticated, canCreateOrder),
        updateOrder: or(and(canUpdateOwnOrder, isReadingOwnOrder), canUpdateAnyOrder, isAdmin),
        cancelOrder: or(and(canUpdateOwnOrder, isReadingOwnOrder), canUpdateAnyOrder, isAdmin),
    },
}, {
    allowExternalErrors: true,
});
