import { Construct } from 'constructs';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface RedisElastiCacheProps {
    vpc: ec2.IVpc;
    subnetGroupName: string;
    securityGroupName: string;
    clusterName: string;
    port?: number;
    cacheNodeType?: string;
    numCacheNodes?: number;
    ssmParameterPrefix?: string;
    description?: string;
}

export class RedisElastiCache extends Construct {
    public readonly redisEndpoint: string;
    public readonly redisPort: string;

    constructor(scope: Construct, id: string, props: RedisElastiCacheProps) {
        super(scope, id);

        const { vpc, subnetGroupName, securityGroupName, clusterName, port = 6379, cacheNodeType = "cache.t3.micro", numCacheNodes = 1, description = "Elasticache Redis Cluster", } = props;

        const subnetGroup = this.createSubnetGroup(vpc, subnetGroupName, description);
        const securityGroup = this.createSecurityGroup(vpc, securityGroupName, port, description);
        const cluster = this.createCacheCluster(clusterName, cacheNodeType, numCacheNodes, subnetGroup, securityGroup);
        this.redisEndpoint = cluster.attrRedisEndpointAddress;

        this.redisPort = cluster.attrRedisEndpointPort;

        new cdk.CfnOutput(this, "RedisUrlOutput", {
            exportName: `${cdk.Stack.of(this).stackName}-RedisUrl`,
            value: `redis://${this.redisEndpoint}:${this.redisPort}`,
        });

        if (props.ssmParameterPrefix) {
            new cdk.aws_ssm.StringParameter(this, `${clusterName}-SSMParam`, {
                parameterName: `${props.ssmParameterPrefix}/redis-endpoint`,
                stringValue: `redis://${this.redisEndpoint}:${this.redisPort}`,
            });
        }
    }

    private createSubnetGroup(vpc: ec2.IVpc, subnetGroupName: string, description: string): elasticache.CfnSubnetGroup {
        return new elasticache.CfnSubnetGroup(this, `${subnetGroupName}-SubnetGroup`, {
            subnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
            cacheSubnetGroupName: subnetGroupName,
            description: description,
        });
    }

    private createSecurityGroup(vpc: ec2.IVpc, securityGroupName: string, port: number, description: string): ec2.SecurityGroup {

        const securityGroup = new ec2.SecurityGroup(this, `${securityGroupName}-SecurityGroup`, {
            vpc,
            allowAllOutbound: true,
            description,
            securityGroupName,
        });

        securityGroup.addIngressRule(
            ec2.Peer.ipv4(vpc.vpcCidrBlock),
            ec2.Port.tcp(port),
            `Allow Redis access on port ${port}`
        );

        return securityGroup;
    }

    private createCacheCluster(clusterName: string, cacheNodeType: string, numCacheNodes: number, subnetGroup: elasticache.CfnSubnetGroup, securityGroup: ec2.SecurityGroup): elasticache.CfnCacheCluster {
        const cluster = new elasticache.CfnCacheCluster(this, `${clusterName}-Cluster`, {
            engine: 'redis',
            cacheNodeType: cacheNodeType,
            numCacheNodes: numCacheNodes,
            clusterName: clusterName,
            vpcSecurityGroupIds: [securityGroup.securityGroupId],
            cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName,
        });

        cluster.addDependency(subnetGroup);
        return cluster;
    }
}