import { z } from "zod";

const SortOrderSchema = z.nativeEnum({
    ASC: "ASC",
    DESC: "DESC",
});

const PaginationSchema = z.object({
    limit: z
        .number()
        .int()
        .positive({ message: "Limit must be a positive integer." }),
    sort: SortOrderSchema,
    nextToken: z.any().optional(),
});

const FileSchema = z.object({
    filename: z.string().min(1, "Filename is required"),
    mimetype: z.string().min(1, "MIME type is required"),
    encoding: z.string().min(1, "Encoding is required"),
});


export { SortOrderSchema, PaginationSchema, FileSchema };