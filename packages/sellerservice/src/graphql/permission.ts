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

    try {
        const user = await validateToken(token);
        context.user = user;

        console.log(user);

        return !!user;
    } catch {
        return false;
    }
});

const canReadAnySeller = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:any_seller");
});

const canReadOwnSeller = rule()((parent, args, { user }) => {
    return checkPermission(user, "read:own_seller");
});

const canCreateSeller = rule()((parent, args, { user }) => {
    return checkPermission(user, "create:seller");
});

const canUpdateAnySeller = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:any_seller");
});

const canUpdateOwnSeller = rule()((parent, args, { user }) => {
    return checkPermission(user, "update:own_seller");
});

const isReadingOwnSeller = rule()((parent, { sellerId }, { user }) => {
    return user?.sub === sellerId;
});

const isAdmin = rule()((parent, args, { user }) => {
    return checkPermission(user, "admin");
});

const anyOne = rule()((parent, args, { user }) => {
    return true;
});

export default shield(
    {
        Query: {
            getSellerById: or(and(canReadOwnSeller, isReadingOwnSeller), canReadAnySeller),
            getAllSellers: and(isAuthenticated, isAdmin),
            getSellerAddresses: or(and(canReadOwnSeller, isReadingOwnSeller), canReadAnySeller),
        },
        Mutation: {
            createSeller: and(anyOne),
            updateSeller: or(and(canUpdateOwnSeller, isReadingOwnSeller), canUpdateAnySeller, isAdmin),
            deleteSeller: or(and(canUpdateOwnSeller, isReadingOwnSeller), canUpdateAnySeller, isAdmin),
        },
    },
    {
        allowExternalErrors: true,
    }
);
