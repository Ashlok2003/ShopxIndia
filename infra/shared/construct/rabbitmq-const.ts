import * as amazonmq from "@cdklabs/cdk-amazonmq";
import * as cdk from 'aws-cdk-lib';
import { Duration } from "aws-cdk-lib";
import { InstanceType, IVpc, SubnetType } from "aws-cdk-lib/aws-ec2";
import { ISecret } from "aws-cdk-lib/aws-secretsmanager";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from "constructs";

export interface AmazonRabbitMQProps {
    vpc: IVpc;
    adminSecret: ISecret;
    instanceType: InstanceType;
    engineVersion?: amazonmq.RabbitMqBrokerEngineVersion;
    publiclyAccessible?: boolean;
    configurationName?: string;
    consumerTimeout?: Duration;
    ssmParameterPrefix?: string;
}

export class AmazonRabbitMQ extends Construct {
    public readonly broker: amazonmq.RabbitMqBrokerInstance;
    public readonly brokerUrl: string;

    constructor(scope: Construct, id: string, props: AmazonRabbitMQProps) {
        super(scope, id);

        const engineVersion = props.engineVersion || amazonmq.RabbitMqBrokerEngineVersion.V3_13;

        const configuration = new amazonmq.RabbitMqBrokerConfiguration(this, "CustomConfiguration", {
            configurationName: props.configurationName || `${cdk.Stack.of(this).stackName}-CustomRabbitMQConfiguration`,
            description: "Custom RabbitMQ Configuration",
            engineVersion,
            definition: amazonmq.RabbitMqBrokerConfigurationDefinition.parameters({
                consumerTimeout: props.consumerTimeout || Duration.minutes(20),
            }),
        });

        this.broker = new amazonmq.RabbitMqBrokerInstance(this, "RabbitMQBroker", {
            publiclyAccessible: props.publiclyAccessible ?? false,
            version: engineVersion,
            instanceType: props.instanceType,
            admin: {
                username: props.adminSecret.secretValueFromJson("username").unsafeUnwrap(),
                password: props.adminSecret.secretValueFromJson("password"),
            },
            configuration,
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_WITH_EGRESS,
            },
        });

        const username = props.adminSecret.secretValueFromJson("username").unsafeUnwrap();
        const password = props.adminSecret.secretValueFromJson("password").unsafeUnwrap();
        const endpoint = this.broker.endpoints.amqp.url;
        this.brokerUrl = `amqp://${username}:${password}@${endpoint}:5672`;
        

        const ssmParameterPrefix = props.ssmParameterPrefix || `/${cdk.Stack.of(this).stackName}`;
        
        new ssm.StringParameter(this, "RabbitMqUrlParameter", {
            parameterName: `${ssmParameterPrefix}/rabbitMqUrl`,
            stringValue: this.brokerUrl,
        });

        new ssm.StringParameter(this, "RabbitMqEndpointParameter", {
            parameterName: `${ssmParameterPrefix}/rabbitMqEndpoint`,
            stringValue: endpoint,
        });

        new cdk.CfnOutput(this, "RabbitMqUrlOutput", {
            exportName: `${cdk.Stack.of(this).stackName}-RabbitMqUrl`,
            value: this.brokerUrl,
        });

        new cdk.CfnOutput(this, "RabbitMqEndpointOutput", {
            exportName: `${cdk.Stack.of(this).stackName}-RabbitMqEndpoint`,
            value: endpoint,
        });
    }
}
