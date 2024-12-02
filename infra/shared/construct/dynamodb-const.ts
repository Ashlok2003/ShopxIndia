import * as cdk from 'aws-cdk-lib';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface DynamoDBProps {
    readonly tableName: string;
    readonly indexes?: {
        indexName: string;
        partitionKey: dynamodb.Attribute;
        sortKey?: dynamodb.Attribute;
        projectionType?: dynamodb.ProjectionType;
    }[];
    readonly removalPolicy?: cdk.RemovalPolicy;
    readonly replicationRegions?: string[];
    readonly ssmParameterPrefix?: string;
    readonly region?: string;
}

export class DynamoDB extends Construct {
    public readonly dynamoTable: dynamodb.Table;
    public readonly dynamoDBUrl: string;

    constructor(scope: Construct, id: string, props: DynamoDBProps) {
        super(scope, id);

        this.dynamoTable = new dynamodb.Table(this, "DynamoDBTable", {
            tableName: props.tableName,
            partitionKey: { name: "PK", type: dynamodb.AttributeType.STRING },
            sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: props.removalPolicy || cdk.RemovalPolicy.DESTROY,
            replicationRegions: props.replicationRegions || [],
        });

        if (props.indexes) {
            for (const index of props.indexes) {
                this.dynamoTable.addGlobalSecondaryIndex({
                    indexName: index.indexName,
                    partitionKey: { name: index.partitionKey.name, type: dynamodb.AttributeType.STRING },
                    projectionType: dynamodb.ProjectionType.ALL,
                });
            }
        }

        const region = props.region || cdk.Stack.of(this).region;
        this.dynamoDBUrl = `https://dynamodb.${region}.amazonaws.com/${props.tableName}`;


        if (props.ssmParameterPrefix) {
            new ssm.StringParameter(this, `${props.tableName}-SSMParam`, {
                parameterName: `${props.ssmParameterPrefix}/dynamodb-url`,
                stringValue: this.dynamoDBUrl,
            });
        }
    }

    public grantEcsTaskAccess(taskRole: iam.IRole) {
        this.dynamoTable.grantReadWriteData(taskRole);
    }
}