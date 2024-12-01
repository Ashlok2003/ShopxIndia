import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export interface RDBSProps  {
    vpc: ec2.IVpc;
    databaseName: string;
    instanceType?: ec2.InstanceType;
    multiAz?: boolean;
    publiclyAccessible?: boolean;
    ssmParameterPrefix?: string;
}

export class RDBS extends Construct {
    public readonly dbEndpoint: string;
    public readonly dbSecret: secretsmanager.ISecret;

    constructor(scope: Construct, id: string, props: RDBSProps) {
        super(scope, id);

        const instanceType = props.instanceType || ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE2, ec2.InstanceSize.MICRO);
        const multiAz = props.multiAz ?? true;
        const publiclyAccessible = props.publiclyAccessible ?? false;
        const ssmParameterPrefix = props.ssmParameterPrefix || `/${cdk.Stack.of(this).stackName}-Postgres`;

        const securityGroup = new ec2.SecurityGroup(this, 'PostgresSG', {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: "Secuity group for PostgreSQL instance"
        });

        securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5432), 'Allow PostgreSQL traffic');

        this.dbSecret = new secretsmanager.Secret(this, "PostgresSecret", {
            secretName: `${cdk.Stack.of(this).stackName}-PostgresSecret`,
            generateSecretString: {
                secretStringTemplate: JSON.stringify({
                    username: 'postgres',
                }),
                generateStringKey: 'password',
                excludePunctuation: true
            }
        });

        const postgresInstance = new rds.DatabaseInstance(this, "PostgresInstance", {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_14,
            }),
            vpc: props.vpc,
            securityGroups: [securityGroup],
            instanceType: props.instanceType,
            databaseName: props.databaseName,
            credentials: rds.Credentials.fromSecret(this.dbSecret),
            publiclyAccessible: publiclyAccessible,
            multiAz: multiAz,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            monitoringInterval: cdk.Duration.seconds(60),
        });

        this.dbEndpoint = postgresInstance.dbInstanceEndpointAddress;

        const dbConnectionUrl = cdk.Fn.sub(
            `postgres://${this.dbSecret.secretValueFromJson('username')}:${this.dbSecret.secretValueFromJson('password')}@${this.dbEndpoint}:5432/${props.databaseName}`
        );

        new ssm.StringParameter(this, "PostgresConnectionUrlParameter", {
            parameterName: `${ssmParameterPrefix}/dbConnectionUrl`,
            stringValue: dbConnectionUrl,
        });

        new cdk.CfnOutput(this, `${cdk.Stack.of(this).stackName}-PostgresEndpoint`, {
            exportName: `${cdk.Stack.of(this).stackName}-PostgresEndpoint`,
            value: this.dbEndpoint,
        });

        new cdk.CfnOutput(this, `${cdk.Stack.of(this).stackName}-PostgresSecretArn`, {
            exportName: `${cdk.Stack.of(this).stackName}-PostgresSecretArn`,
            value: this.dbSecret.secretArn,
        });

        new cdk.CfnOutput(this, `${cdk.Stack.of(this).stackName}-PostgresConnectionUrl`, {
            exportName: `${cdk.Stack.of(this).stackName}-PostgresConnectionUrl`,
            value: dbConnectionUrl,
        });
    }
}