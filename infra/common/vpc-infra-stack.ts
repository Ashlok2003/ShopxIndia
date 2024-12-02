import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ns from 'aws-cdk-lib/aws-servicediscovery';
import * as sd from 'aws-cdk-lib/aws-servicediscovery';

import { Construct } from 'constructs';

export interface VPCInfraProps extends cdk.StackProps {
    readonly VPCName: string;
    readonly VPCMaxAzs: number;
    readonly VPCCIDR: string;
    readonly NATGatewayCount: number;
    readonly ECSClusterName: string;
    readonly CloudNamespaceName: string;
}

export class VPCInfraStack extends cdk.Stack {

    public readonly vpc: ec2.IVpc;
    public readonly cluster: ecs.Cluster;
    public readonly cloudNameSpace: ns.PrivateDnsNamespace;

    constructor(scope: Construct, id: string, props: VPCInfraProps) {
        super(scope, id, props);

        this.vpc = this.createVpc(props.VPCName, props.VPCMaxAzs, props.VPCCIDR, props.NATGatewayCount);
        
        this.cluster = this.createECSCluster(props.ECSClusterName, this.vpc);

        this.cloudNameSpace = this.createCloudMapNamespace(this.cluster, props.CloudNamespaceName);
    };

    private createVpc(baseName: string, vpcMaxAzs: number, vpcCidr: string, natGateways: number): ec2.IVpc {
        if (vpcMaxAzs <= 0 || vpcCidr.length === 0) {
            throw new Error('Invalid VPC configuration: VPCMaxAzs must be > 0 and VPCCIDR must be non-empty.');
        }

        return  new ec2.Vpc(this, baseName, {
            maxAzs: vpcMaxAzs,
            ipAddresses: ec2.IpAddresses.cidr(vpcCidr),
            natGateways: natGateways,
            subnetConfiguration: [
                {
                    name: `${baseName}-Public`,
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    name: `${baseName}-Private`,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ]
        });
    }

    private createECSCluster(baseName: string, vpc: ec2.IVpc): ecs.Cluster {
        const cluster = new ecs.Cluster(this, baseName, {
            clusterName: baseName,
            vpc: vpc,
            containerInsights: true
        });

        return cluster;
    }

    private createCloudMapNamespace(cluster: ecs.Cluster, namespaceName: string):sd.PrivateDnsNamespace{
        const cloudMapNamespace =  new sd.PrivateDnsNamespace(this, `${namespaceName}Namespace`, {
            name: namespaceName,
            vpc: cluster.vpc,
            description: `Private DNS namespace for ${namespaceName}`,
        });

        return cloudMapNamespace;
    }
}