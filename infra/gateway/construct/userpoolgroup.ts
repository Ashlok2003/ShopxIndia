import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class UserPoolGroups extends Construct {
    constructor(scope: Construct, id: string, userPoolId: string) {
        super(scope, id);

        new cognito.CfnUserPoolGroup(this, "CustomerGroup", {
            userPoolId,
            groupName: "customer",
            description: "Group for customers"
        });

        new cognito.CfnUserPoolGroup(this, "SellerGroup", {
            userPoolId,
            groupName: "seller",
            description: "Group for sellers"
        });
    }
}