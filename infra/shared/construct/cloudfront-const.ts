import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'; // Required for S3Origin
import * as cdk from 'aws-cdk-lib';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

export interface CloudFrontProps {
    bucket: s3.Bucket;
    comment?: string;
}

export class CloudFront extends Construct {

    public readonly distribution: cloudfront.Distribution;

    constructor(scope: Construct, id: string, props: CloudFrontProps) {
        super(scope, id);

        const originAccessIdentity = this.createOriginAccessIdentity();

        this.grantBucketAccess(props.bucket, originAccessIdentity);

        this.distribution = this.createCloudFrontDistribution(props, originAccessIdentity);
    }

    private createOriginAccessIdentity(): cloudfront.OriginAccessIdentity {
        return new cloudfront.OriginAccessIdentity(this, 'CloudFrontOAI', {
            comment: 'Origin Access Identity for CloudFront to access the S3 bucket',
        });
    }

    private grantBucketAccess(bucket: s3.IBucket, oai: cloudfront.OriginAccessIdentity): void {
        bucket.grantRead(oai.grantPrincipal);
    }

    private createCloudFrontDistribution(props: CloudFrontProps, oai: cloudfront.OriginAccessIdentity): cloudfront.Distribution {

        return new cloudfront.Distribution(this, 'CloudFrontDistribution', {
            defaultBehavior: {
                origin: new origins.OriginGroup({
                    primaryOrigin: origins.S3BucketOrigin.withOriginAccessControl(props.bucket),
                    fallbackOrigin: new origins.HttpOrigin('www.example.com'),
                    fallbackStatusCodes: [404],
                }),
                allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            },
            comment: props.comment ?? 'CloudFront distribution for S3 bucket',
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        });
    }
}
