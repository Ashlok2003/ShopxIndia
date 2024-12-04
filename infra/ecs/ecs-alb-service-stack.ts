import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sd from 'aws-cdk-lib/aws-servicediscovery';

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
    cloudMapNamespace: sd.PrivateDnsNamespace;
}

export class ECSAlbServiceStack extends cdk.Stack {

    constructor(scope: Construct, id: string, props: ECSAlbServiceStackProps) {
        super(scope, id, props);

        const serviceConfigs = this.createServices(
            props.commonVpc,
            props.cluster,
            props.cloudMapNamespace,
            props.services
        );

        this.createServiceMonitoring(serviceConfigs, props.centralizedDashboard);
    }

    private createServices(vpc: ec2.IVpc, cluster: ecs.ICluster, cloudMapNamespace: sd.PrivateDnsNamespace, services: ECSServiceProps[]): ServiceConfig[] {
        return services.map((serviceConfig) => {

            const repo = new ECSRepoConstruct(this, `EcsAlbRepoConstruct-${serviceConfig.ServiceName}`, {
                shortStackName: serviceConfig.ServiceName
            });

            const infra = new ECSInfraConstruct(this, `EcsAlbInfraConstruct-${serviceConfig.ServiceName}`, {
                shortStackName: serviceConfig.ServiceName,
                vpc,
                cluster,
                ecrRepo: repo.ecrRepo,
                containerPort: serviceConfig.PortNumber,
                cpu: serviceConfig.Cpu,
                memory: serviceConfig.Memory,
                desiredTasks: serviceConfig.DesiredTasks,
                autoscaling: serviceConfig.AutoScalingEnable,
                dockerImageType: serviceConfig.DockerImageType,
                internetFacing: serviceConfig.InternetFacing,
                cloudNamespace: cloudMapNamespace,
                ssmParameterPrefix: serviceConfig.SSMParameterPrefix,
            });

            new ECSCICDConstruct(this, `EcsAlbCicdConstruct-${serviceConfig.ServiceName}`, {
                service: infra.service,
                containerName: serviceConfig.ServiceName,
                repo: repo.gitRepo,
                ecrRepo: repo.ecrRepo,
                appPath: serviceConfig.DockerPath,
                githubBranch: 'main',
                githubRepo: "Ashlok2003/ShopxIndia",
                githubOauthTokenArn: "github-token",
                pipelineName: serviceConfig.ServiceName
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

    private createServiceMonitoring(services: ServiceConfig[], centralizedDashboard: boolean): void {
        new ECSAlbMultiServiceMonitorConstruct(this, 'MultiServiceMonitor', {
            stackName: "ECSService",
            services,
            centralizedDashboard: centralizedDashboard,
        });
    }
}

