import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { CloudFront } from "./construct/cloudfront-const";
import { DynamoDB } from "./construct/dynamodb-const";
import { RedisElastiCache } from "./construct/elasticache-const";
import { AmazonRabbitMQ } from "./construct/rabbitmq-const";
import { RDBS } from "./construct/rdbs-const";
import { S3Bucket } from "./construct/s3-const";

export interface SharedResourcesStackProps extends cdk.StackProps {
    vpc: ec2.IVpc;
}

export class SharedResourcesStack extends cdk.Stack {
    public readonly s3Bucket: s3.Bucket;
    public readonly dynamoTable: dynamodb.Table;
    public readonly redisEndpoint: string;
    public readonly rdsEndpoint: string;
    public readonly rabbitMqUrl: string;
    public readonly cloudFront: CloudFront;

    constructor(scope: Construct, id: string, props: SharedResourcesStackProps) {
        super(scope, id, props);

        const bucket = new S3Bucket(this, 'MyS3Bucket', {
            bucketName: 'shopxindia',
            allowCors: true,
        });

        this.s3Bucket = bucket.bucket;

        this.cloudFront = new CloudFront(this, 'MyCloudFront', {
            bucket: this.s3Bucket,
            comment: 'CloudFront for S3 Bucket',
        });

        const dynamoDB = new DynamoDB(this, 'MyDynamoDBTable', {
            tableName: 'Store',
            indexes: [{
                indexName: 'MyIndex',
                partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
                sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
                projectionType: dynamodb.ProjectionType.ALL,
            }],
            ssmParameterPrefix: '/shared-resources/dynamodb',
        });

        this.dynamoTable = dynamoDB.dynamoTable;

        const redisCache = new RedisElastiCache(this, 'MyRedisElastiCache', {
            vpc: props.vpc,
            subnetGroupName: 'RedisSubnetGroup',
            securityGroupName: 'RedisSecurityGroup',
            clusterName: 'MyRedisCluster',
            ssmParameterPrefix: '/shared-resources/redis',
        });

        this.redisEndpoint = redisCache.redisEndpoint;

        const rdsInstance = new RDBS(this, 'MyPostgresDB', {
            vpc: props.vpc,
            databaseName: 'mydatabase',
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
            ssmParameterPrefix: '/shared-resources/rds',
        });

        this.rdsEndpoint = rdsInstance.dbEndpoint;

        const rabbitMqSecret = new secretsmanager.Secret(this, 'RabbitMQAdminSecret', {
            secretName: '/shared-resources/rabbitmq/admin',
            generateSecretString: {
                secretStringTemplate: JSON.stringify({ username: 'admin' }),
                generateStringKey: 'password',
                excludePunctuation: true
            }
        });

        const rabbitMq = new AmazonRabbitMQ(this, 'MyRabbitMQ', {
            vpc: props.vpc,
            adminSecret: rabbitMqSecret,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO),
            ssmParameterPrefix: '/shared-resources/rabbitmq',
        });

        this.rabbitMqUrl = rabbitMq.brokerUrl;
    }
}