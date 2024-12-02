#!/usr/bin/env node

import { VPCInfraStack } from './common/vpc-infra-stack';
import { ECSAlbServiceStack} from "./ecs/ecs-alb-service-stack";
import { SharedResourcesStack } from "./shared/shared-resources";
import { GatewayStack } from "./gateway/gateway-stack";
import * as cdk from 'aws-cdk-lib';
import { CommonHelper } from './utils/commonhelper';
import * as path from 'path';

try {
    const app = new cdk.App();

    const stackProps = new CommonHelper(path.resolve(__dirname, '..', 'config', 'app-config.json'));

    const vpcConfig = stackProps.getVpcConfig();
    const sharedConfig = stackProps.getSharedConfig();
    const ecsServicesConfig = stackProps.getEcsServicesConfig();

    const vpc_stack = new VPCInfraStack(app, "VPCInfra", vpcConfig);

    new SharedResourcesStack(app, "SharedResources", {
        vpc: vpc_stack.vpc,
        ...sharedConfig
    });

    new ECSAlbServiceStack(app, "ECSService", {
        commonVpc: vpc_stack.vpc,
        cluster: vpc_stack.cluster,
        cloudMapNamespace: vpc_stack.cloudNameSpace,
        ...ecsServicesConfig,
    });

    new GatewayStack(app, "GatewayStack", {
        apiKey: "shopxindia",
        vpc: vpc_stack.vpc,
        cloudNamespace: vpc_stack.cloudNameSpace,
        cognitoProps: {
            appName: "shopxindia"
        }
    });

} catch (error: any) {
    console.log(error);
}