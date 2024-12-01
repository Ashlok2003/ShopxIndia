import { z } from "zod";

const AddNewAddressInputSchema = z.object({
    street: z.string().min(1, "Street is required."),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State is required."),
    country: z.string().min(1, "Country is required."),
    postalCode: z
        .string()
        .min(5, "Postal code must be at least 5 characters long.")
        .regex(/^\d+$/, "Postal code must be numeric."),
});


const UpdateAddressInputSchema = z.object({
    id: z.string().uuid("Invalid address ID format."),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
}).refine(
    (data: any) => Object.keys(data).some((key) => key !== "id" && data[key] !== undefined),
    {
        message: "At least one address field (street, city, state, country, or postalCode) must be provided.",
        path: ["updateAddressFields"],
    }
);

const CreateSellerInputSchema = z.object({
    name: z.string().min(1, "Seller name is required."),
    email: z.string().email("Invalid email format."),
    description: z.string(),
    address: AddNewAddressInputSchema,
});

const PaginationInputSchema = z.object({
    skip: z.number(),
    take: z.number().positive()
});

const UpdateSellerInputSchema = z.object({
    sellerId: z.string(),
    name: z.string().optional(),
    email: z.string().email("Invalid email format.").optional(),
    description: z.string().optional(),
    address: UpdateAddressInputSchema.optional(),
}).refine(
    (data: any) => Object.keys(data).some((key) => key !== "sellerId" && data[key] !== undefined),
    {
        message: "At least one seller field (name, email, description, or address) must be provided.",
        path: ["updateSellerFields"],
    }
);

export { AddNewAddressInputSchema, PaginationInputSchema, UpdateAddressInputSchema, CreateSellerInputSchema, UpdateSellerInputSchema };
