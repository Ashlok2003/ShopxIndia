import { and, or, rule, shield } from "graphql-shield";
import { validateToken } from "../config/auth";
import { checkPermission } from "../utils/checkPermission";

const isAuthenticated = rule()(async (parent, args, context) => {
    const authHeader = context.headers;

    if (!authHeader || !authHeader.startsWith("Bearer ")) return false;

    const token = authHeader.replace("Bearer ", "");
    const user = await validateToken(token);
    context.user = user;

    return !!user;
});

const canAccessOwnData = rule()(async (parent, { userId }, { user }) => user?.sub === userId);
const canAccessAdminData = rule()((parent, args, { user }) => checkPermission(user, "admin"));
const canManageOwnCart = rule()((parent, args, { user }) => {
    return user !== undefined;
});

export default shield({
    Query: {
        getCartDetails: and(isAuthenticated, canManageOwnCart),
        getUserDetails: and(isAuthenticated, or(canAccessOwnData, canAccessAdminData)),
        getAllUsers: and(isAuthenticated, canAccessAdminData),
    },
    Mutation: {
        addItemToCart: and(isAuthenticated, canManageOwnCart),
        updateItemQuantity: and(isAuthenticated, canManageOwnCart),
        removeItemFromCart: and(isAuthenticated, canManageOwnCart),
        clearCart: and(isAuthenticated, canManageOwnCart),
        createUser: and(isAuthenticated),
        updateUser: and(isAuthenticated, or(canAccessOwnData, canAccessAdminData)),
        updateUserSettings: and(isAuthenticated, or(canAccessOwnData, canAccessAdminData)),
        addAddress: and(isAuthenticated, or(canAccessOwnData, canAccessAdminData)),
        updateAddress: and(isAuthenticated, or(canAccessOwnData, canAccessAdminData)),
        deleteAddress: and(isAuthenticated, or(canAccessOwnData, canAccessAdminData)),
    },
}, {
    allowExternalErrors: true,
});
