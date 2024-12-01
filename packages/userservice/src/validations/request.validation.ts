import { z } from "zod";

const PaginationSchema = z.object({
    take: z.number().positive(),
    skip: z.number().nonnegative()
});


export { PaginationSchema };