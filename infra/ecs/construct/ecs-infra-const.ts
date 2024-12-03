import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as lb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sd from 'aws-cdk-lib/aws-servicediscovery';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface ECSInfraProps {
    shortStackName: string;
    vpc: ec2.IVpc;
    cluster: ecs.ICluster;
    containerPort: number;
    cpu: number;
    memory: number;
    desiredTasks: number;
    autoscaling: boolean;
    minTasks: number;
    maxTasks: number;
    dockerImageType: string;
    ecrRepo: ecr.Repository;
    internetFacing: boolean;
    cloudNamespace: sd.PrivateDnsNamespace;
    ssmParameterPrefix: string;
}

export class ECSInfraConstruct extends Construct {
    public readonly service: ecs.FargateService;
    public readonly alb: lb2.ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: ECSInfraProps) {
        super(scope, id);

        if (!props.vpc || !props.cluster || !props.ecrRepo) {
            throw new Error("VPC, ECS Cluster, and ECR Repository are required.");
        }

        const logDriver = new ecs.AwsLogDriver({
            streamPrefix: `${props.shortStackName}-logs`,
            logRetention: logs.RetentionDays.ONE_WEEK,
        });

        const alb = new lb2.ApplicationLoadBalancer(this, 'ALB', {
            vpc: props.vpc,
            internetFacing: props.internetFacing,
            loadBalancerName: `${props.shortStackName}-alb`,
        });

        const albFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `Service`, {
            loadBalancer: alb,
            cluster: props.cluster,

            desiredCount: props.desiredTasks,
            cpu: props.cpu,
            memoryLimitMiB: props.memory,

            cloudMapOptions: {
                name: props.shortStackName,
                cloudMapNamespace: props.cloudNamespace
            },

            circuitBreaker: {
                rollback: true
            },

            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
                containerPort: props.containerPort,
                environment: this.getContainerEnvironment(props),
                enableLogging: true,
                logDriver
            },

            publicLoadBalancer: false
        });

        this.alb = albFargateService.loadBalancer;
        this.service = albFargateService.service;

        this.putParameter(`${props.shortStackName}AlbDnsName`, albFargateService.loadBalancer.loadBalancerDnsName);
        this.putParameter(`${props.shortStackName}ServiceSecurityGroupId`, this.service.connections.securityGroups[0].securityGroupId);

        albFargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '30');

        if (albFargateService.taskDefinition.executionRole) {
            this.appendEcrReadPolicy('ecs-ecr-get-image', albFargateService.taskDefinition.executionRole);
        }
    }

    private getContainerEnvironment(props: ECSInfraProps): { [key: string]: string } {
        const environmentVariables = {
            BUCKET_NAME: this.fetchSSMParameter(`${props.ssmParameterPrefix}/bucket-name`),
            DYNAMODB_URL: this.fetchSSMParameter(`${props.ssmParameterPrefix}/dynamodb-url`),
            REDIS_URL: this.fetchSSMParameter(`${props.ssmParameterPrefix}/redis-endpoint`),
            RABBITMQ_URL: this.fetchSSMParameter(`${props.ssmParameterPrefix}/rabbitMqUrl`),
            DATABASE_URL: this.fetchSSMParameter(`${props.ssmParameterPrefix}/dbConnectionUrl`),
            CLOUDFRONT_DOMAIN: this.fetchSSMParameter(`${props.ssmParameterPrefix}/cloudfront-url`),
            ENVIRONMENT: "PRODUCTION",
        };

        return environmentVariables;
    }

    private fetchSSMParameter(parameterName: string): string {
        try {
            return ssm.StringParameter.valueForStringParameter(this, parameterName);
        } catch (error) {
            console.error(`Failed to fetch SSM parameter for ${parameterName}`, error);
            return '';
        }
    }

    private appendEcrReadPolicy(baseName: string, role: iam.IRole) {
        const statement = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ['*'],
            actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage"
            ]
        });

        const policy = new iam.Policy(this, baseName);
        policy.addStatements(statement);

        role.attachInlinePolicy(policy);
    }

    private putParameter(name: string, value: string) {
        new ssm.StringParameter(this, name, {
            parameterName: name,
            stringValue: value,
        });
    }
}