import { z } from "zod";


const PaymentStatusEnum = z.enum(["PENDING", "FAILED", "SUCCESS", "REFUNDED", "CANCELLED"]);

const PaymentIdSchema = z.string().min(1, "Invalid Payment ID format.");
const UserIdSchema = z.string().min(1, "Invalid User ID format.");
const OrderIdSchema = z.string().min(1, "Invalid orderId format.");

const CompletePaymentInputSchema = z.object({
    paymentId: z.string().uuid("Invalid Payment ID format."),
    orderId: z.string().min(1, "Invalid Order ID format."),
    code: z.string().nonempty("Code cannot be empty."),
});


export { CompletePaymentInputSchema, OrderIdSchema, PaymentIdSchema, UserIdSchema, PaymentStatusEnum };
