import { z } from "zod";

const GenerateQRInputSchema = z.object({
    paymentId: z.string().uuid("Invalid payment ID format"),
});

export { GenerateQRInputSchema };