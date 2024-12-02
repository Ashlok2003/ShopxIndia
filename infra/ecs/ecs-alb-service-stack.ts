import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sd from 'aws-cdk-lib/aws-servicediscovery';
import * as ssm from 'aws-cdk-lib/aws-ssm';

import { Construct } from 'constructs';
import { ECSCICDConstruct } from './construct/ecs-cicd.const';
import { ECSInfraConstruct } from './construct/ecs-infra-const';
import { ECSAlbMultiServiceMonitorConstruct, ServiceConfig } from './construct/ecs-monitor-const';
import { ECSRepoConstruct } from './construct/ecs-repo-const';

export interface ECSServiceProps {
    ShortStackName: string;
    ServiceName: string;
    PortNumber: number;
    Cpu: number;
    Memory: number;
    DesiredTasks: number;
    AlarmThreshold: number;
    SubscriptionEmails: string[];
    AutoScalingEnable: boolean;
    AutoScalingMinCapacity: number;
    AutoScalingMaxCapacity: number;
    DockerImageType: string;
    DockerPath: string;
    InfraVersion: string;
    InternetFacing: boolean;
    SSMParameterPrefix: string;
}

export interface ECSAlbServiceStackProps extends cdk.StackProps {
    services: ECSServiceProps[];
    centralizedDashboard: boolean;
    commonVpc: ec2.IVpc,
    cluster: ecs.ICluster;
    cloudMapNamespace: sd.IPrivateDnsNamespace;
}

export class ECSAlbServiceStack extends cdk.Stack {
    public readonly commonVpc: ec2.IVpc;
    public readonly ecsCluster: ecs.ICluster;
    public readonly props: ECSAlbServiceStackProps;
    public readonly cloudMapNamespace: sd.IPrivateDnsNamespace;

    constructor(scope: Construct, id: string, props: ECSAlbServiceStackProps) {
        super(scope, id, props);
        
        this.props = props;

        this.ecsCluster = props.cluster;
        this.commonVpc = props.commonVpc;
        this.cloudMapNamespace = props.cloudMapNamespace;

        this.onEcsPostConstructor(this.commonVpc, this.ecsCluster, this.cloudMapNamespace);
    }

    private onEcsPostConstructor(vpc: ec2.IVpc, cluster: ecs.ICluster, ns: sd.IPrivateDnsNamespace): void {
        const services = this.createServices(vpc, cluster, ns);
        this.createServiceMonitoring(services);
    }

    private createServices(vpc: ec2.IVpc, cluster: ecs.ICluster, ns: sd.IPrivateDnsNamespace): ServiceConfig[] {
        return this.props.services.map((serviceConfig) => {

            const repo = new ECSRepoConstruct(this, `EcsAlbRepoConstruct-${serviceConfig.ServiceName}`, {
                shortStackName: serviceConfig.ServiceName
            });

            const infra = new ECSInfraConstruct(this, `EcsAlbInfraConstruct-${serviceConfig.ServiceName}`, {
                shortStackName: serviceConfig.ServiceName,
                vpc: vpc,
                cluster: cluster,
                ecrRepo: repo.ecrRepo,
                containerPort: serviceConfig.PortNumber,
                cpu: serviceConfig.Cpu,
                memory: serviceConfig.Memory,
                desiredTasks: serviceConfig.DesiredTasks,
                autoscaling: serviceConfig.AutoScalingEnable,
                minTasks: serviceConfig.AutoScalingMinCapacity,
                maxTasks: serviceConfig.AutoScalingMaxCapacity,
                dockerImageType: serviceConfig.DockerImageType,
                dockerPath: serviceConfig.DockerPath,
                infraVersion: serviceConfig.InfraVersion,
                internetFacing: serviceConfig.InternetFacing,
                cloudMapNamespace: this.cloudMapNamespace,
                ssmParameterPrefix: serviceConfig.SSMParameterPrefix,
            });

            new ECSCICDConstruct(this, `EcsAlbCicdConstruct-${serviceConfig.ServiceName}`, {
                service: infra.service,
                containerName: infra.containerName,
                repo: repo.gitRepo,
                ecrRepo: repo.ecrRepo,
                appPath: serviceConfig.DockerPath
            });

            return {
                serviceName: serviceConfig.ServiceName,
                ecsService: infra.service,
                alb: infra.alb,
                alarmThreshold: serviceConfig.AlarmThreshold,
                subscriptionEmails: serviceConfig.SubscriptionEmails,
            };
        });
    }

    private createServiceMonitoring(services: ServiceConfig[]): void {
        new ECSAlbMultiServiceMonitorConstruct(this, 'MultiServiceMonitor', {
            stackName: "ECSService",
            services,
            centralizedDashboard: this.props.centralizedDashboard,
        });
    }

    private getParameter(name: string): string {
        const parameter = ssm.StringParameter.fromStringParameterAttributes(this, name, {
            parameterName: name,
        });
        return parameter.stringValue;
    }
}

