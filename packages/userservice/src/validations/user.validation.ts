import { z } from "zod";

const UserCreateInputSchema = z.object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    phoneNo: z.string().optional(),
});

const UserUpdateInputSchema = z.object({
    userId: z.string().uuid("Invalid user ID."),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address.").optional(),
    phoneNo: z.string().optional(),
    isActive: z.boolean().optional(),
});

const UpdateUserSettingsSchema = z.object({
    userId: z.string().uuid("Invalid user ID."),
    receiveEmails: z.boolean().optional(),
    receiveSms: z.boolean().optional(),
    theme: z.enum(["LIGHT", "DARK"]).optional(),
    notifications: z.boolean().optional(),
});

const CreateAddressDTOSchema = z.object({
    userId: z.string(),
    street: z.string().min(1, "Street is required."),
    city: z.string().min(1, "City is required."),
    state: z.string().min(1, "State is required."),
    country: z.string().min(1, "Country is required."),
    postalCode: z.string().min(1, "Postal code is required."),
    isDefault: z.boolean().optional(),
});

const UpdateAddressDTOSchema = z.object({
    addressId: z.string(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    isDefault: z.boolean().optional(),
});

export { UpdateAddressDTOSchema, CreateAddressDTOSchema, UpdateUserSettingsSchema, UserCreateInputSchema, UserUpdateInputSchema };
