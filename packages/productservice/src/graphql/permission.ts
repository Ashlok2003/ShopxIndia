import { rule, shield, and } from "graphql-shield";
import { validateToken } from "../config/auth";
import { checkPermission } from "../utils/checkPermission";

const isAuthenticated = rule()(async (_, __, context) => {
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

const canCreateProduct = rule()((_, __, { user }) => {
    return checkPermission(user, "create:product");
});

const canUpdateProduct = rule()((_, __, { user }) => {
    return checkPermission(user, "update:product");
});

const canDeleteProduct = rule()((_, __, { user }) => {
    return checkPermission(user, "delete:product");
});

const canCreateCategory = rule()((_, __, { user }) => {
    return checkPermission(user, "create:category");
});

const canUpdateCategory = rule()((_, __, { user }) => {
    return checkPermission(user, "update:category");
});

const canDeleteCategory = rule()((_, __, { user }) => {
    return checkPermission(user, "delete:category");
});

const productAccess = rule()((_, __, { user }) => {
    return true;
});

export default shield(
    {
        Query: {
            getProductById: and(productAccess),
            listProducts: and(productAccess),
            getProductsByName: and(productAccess),
            getProductsByCategoryName: and(productAccess),
            listAllCategories: and(productAccess),
            getProductsWhichNameStartsWith: and(productAccess),
        },
        Mutation: {
            createProduct: and(isAuthenticated, canCreateProduct),
            updateProduct: and(isAuthenticated, canUpdateProduct),
            deleteProduct: and(isAuthenticated, canDeleteProduct),
            createProducts: and(isAuthenticated, canCreateProduct),
            deleteProducts: and(isAuthenticated, canDeleteProduct),
            createCategory: and(isAuthenticated, canCreateCategory),
            updateCategory: and(isAuthenticated, canUpdateCategory),
            deleteCategory: and(isAuthenticated, canDeleteCategory),
        },
    },
    {
        allowExternalErrors: true,
    }
);
