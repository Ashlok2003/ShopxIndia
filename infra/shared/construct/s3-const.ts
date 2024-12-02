import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export interface S3Props {
    bucketName: string,
    allowCors?: boolean;
    ssmParameterPrefix: string;
}

export class S3Bucket extends Construct {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props: S3Props) {
        super(scope, id);

        const s3CorsRule: s3.CorsRule[] = props.allowCors ? [
            {
                allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
                allowedOrigins: ["*"],
                allowedHeaders: ["*"],
                maxAge: 300,
            }
        ] : [];

        this.bucket = new s3.Bucket(this, `${props.bucketName}`, {
            bucketName: props.bucketName,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            accessControl: s3.BucketAccessControl.PRIVATE,
            encryption: s3.BucketEncryption.S3_MANAGED,
            cors: s3CorsRule,
            versioned: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: false,
        });

        new ssm.StringParameter(this, "PostgresConnectionUrlParameter", {
            parameterName: `${props.ssmParameterPrefix}/bucket-name`,
            stringValue: this.bucket.bucketName,
        });
    }
}