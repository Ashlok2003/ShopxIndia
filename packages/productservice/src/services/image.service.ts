import { PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { BusinessException } from "../error/customError";
import { FileType, IFile } from "../interfaces/image";
import { Logger } from "../utils/logger";

export class ImageService {
    private readonly s3: S3Client;
    private logger: Logger = Logger.getInstance({ serviceName: "ImageService", logLevel: "debug" });

    constructor() {
        this.s3 = process.env.ENVIRONMENT === "PRODUCTION"
            ? new S3Client({ region: process.env.REGION })
            : new S3Client({
                endpoint: process.env.S3_ENDPOINT || "http://localhost:4566",
                region: "us-east-1",
                forcePathStyle: true
            });
    }

    async singleUpload(file: any): Promise<IFile> {
        try {

            const { createReadStream, filename, mimetype, encoding } = await file;


            if (!filename) {
                throw new Error("File name is undefined or empty.");
            }

            const stream = createReadStream();
            const filePath = `inventory/${filename}`;
            const BUCKET_NAME = process.env.BUCKET_NAME;
            const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

            if (!BUCKET_NAME) {
                throw new BusinessException("BUCKET_NAME environment variable is not set.");
            }

            if (!CLOUDFRONT_DOMAIN) {
                throw new BusinessException("CLOUDFRONT_DOMAIN environment variable is not set.");
            }

            const uploadParams: PutObjectCommandInput = {
                Bucket: BUCKET_NAME,
                Key: filePath,
                Body: stream,
                ContentType: mimetype,
            };

            const upload = new Upload({
                client: this.s3,
                params: uploadParams,
            });

            await upload.done();

            const fileUrl = `${CLOUDFRONT_DOMAIN}/${filePath}`;
            return { filename, mimetype, encoding, url: fileUrl };
        } catch (error) {
            this.logger.error("Error Uploading to S3:", error);
            throw new BusinessException("Failed to upload file");
        }
    }

    async batchUpload(files: any[]): Promise<IFile[]> {
        try {

            if (!Array.isArray(files) || files.length === 0) {
                throw new BusinessException("Files array is empty or not valid.");
            }

            const uploadPromises = files.map(file => this.singleUpload(file));
            const uploadedFiles = await Promise.all(uploadPromises);

            return uploadedFiles;
        } catch (error: any) {
            console.log(error);
            this.logger.error("Error Uploading to S3:", error);
            throw new BusinessException("Failed to upload file");
        }
    }
}