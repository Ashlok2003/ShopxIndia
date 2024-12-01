import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as loadBalancer from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface ECSInfraProps {
    shortStackName: string;
    infraVersion: string;
    vpc: ec2.IVpc;
    cluster: ecs.ICluster;
    dockerImageType: string;
    ecrRepo: ecr.Repository;
    containerPort: number;
    internetFacing: boolean;
    dockerPath: string;
    memory: number;
    cpu: number
    desiredTasks: number;
    autoscaling: boolean;
    minTasks: number;
    maxTasks: number;
    sharedResources: {
        ssmParameterNames: { [key: string]: string };
        bucketName: string;
    };
}

export class ECSInfraConstruct extends Construct {
    containerName: string;
    service: ecs.FargateService;
    alb: loadBalancer.ApplicationLoadBalancer;

    constructor(scope: Construct, id: string, props: ECSInfraProps) {
        super(scope, id);

        const alb = new loadBalancer.ApplicationLoadBalancer(this, 'alb', {
            loadBalancerName: `${props.shortStackName}-alb`,
            vpc: props.vpc,
            internetFacing: props.internetFacing
        });

        const baseName = props.shortStackName;
        this.containerName = `${baseName}Container`;

        const albFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, `Service`, {
            loadBalancer: alb,
            cluster: props.cluster,

            desiredCount: props.desiredTasks,
            cpu: props.cpu,
            memoryLimitMiB: props.memory,

            cloudMapOptions: {
                name: props.shortStackName
            },
            circuitBreaker: {
                rollback: true
            },
            taskImageOptions: {
                image: this.getContainerImage(props),
                containerName: this.containerName,
                containerPort: props.containerPort,
                environment: this.getContainerEnvironment(props),
                enableLogging: true,
                logDriver: new ecs.AwsLogDriver({
                    streamPrefix: `${baseName}Log`
                }),
            }
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
            BUCKET_NAME: props.sharedResources.bucketName,
            ...this.getSSMEnvironmentVariables(props.sharedResources.ssmParameterNames)
        }

        return environmentVariables;
    }

    private getSSMEnvironmentVariables(ssmParameterNames: { [key: string]: string }): { [key: string]: string } {
        const ssmVariables: { [key: string]: string } = {};

        for (const [key, paramName] of Object.entries(ssmParameterNames)) {
            //! Fetch each SSM parameter and store in environment variables :)
            ssmVariables[key] = ssm.StringParameter.valueForStringParameter(this, paramName);
        }

        return ssmVariables;
    }

    private getContainerImage(props: ECSInfraProps): ecs.ContainerImage {
        if (props.dockerImageType == 'HUB') {
            return ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample");
        } else if (props.dockerImageType == 'ECR') {
            return ecs.ContainerImage.fromEcrRepository(props.ecrRepo);
        } else {
            return ecs.ContainerImage.fromAsset(props.dockerPath);
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