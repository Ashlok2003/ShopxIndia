import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cdk from 'aws-cdk-lib';

export interface CloudFrontProps {
    bucket: s3.Bucket;
    comment?: string;
}

export class CloudFront extends Construct {

    public readonly distribution: cloudfront.CloudFrontWebDistribution;

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
        bucket.grantRead(oai);
    }

    private createCloudFrontDistribution(props: CloudFrontProps, oai: cloudfront.OriginAccessIdentity): cloudfront.CloudFrontWebDistribution {
        return new cloudfront.CloudFrontWebDistribution(this, 'CloudFrontDistribution', {
            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: props.bucket,
                        originAccessIdentity: oai,
                    },
                    behaviors: [
                        {
                            isDefaultBehavior: true,
                            allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD,
                            cachedMethods: cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
                            defaultTtl: cdk.Duration.seconds(3600),
                            maxTtl: cdk.Duration.days(1),
                        },
                    ],
                },
            ],
            comment: props.comment ?? 'CloudFront distribution for S3 bucket',
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
        });
    }
}