import { PaymentStatus } from "@prisma/client";


interface QRValidationResult {
    message: string;
    status: PaymentStatus
}

interface QRCodeData {
    qrString: string;
    code: string;
}



export { QRValidationResult, QRCodeData };