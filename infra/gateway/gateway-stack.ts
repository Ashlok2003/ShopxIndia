import * as base from "../../lib/templates/stack/base/base-stack";
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sd from 'aws-cdk-lib/aws-servicediscovery';
import { AppContext } from "../../lib/templates/app-context";

export class GatewayStack extends base.BaseStack {

    constructor(appContext: AppContext, stackConfig: any) {
        super(appContext, stackConfig);

        
    }
}