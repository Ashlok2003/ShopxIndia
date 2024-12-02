import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class PostConfirmationLambda extends Construct {
    public readonly lambdaFunction: lambda.Function;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.lambdaFunction = new lambda.Function(this, "PostConfirmationLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            handler: "index.handler",
            code: lambda.Code.fromInline(`
                const AWS = require('aws-sdk');
                const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
        
                exports.handler = async (event) => {
                    const userPoolId = event.userPoolId;
                    const username = event.userName;
                    const userType = event.request.userAttributes['custom:userType'];
        
                    let groupName = "";
                    if (userType === "seller") {
                        groupName = "seller";
                    } else {
                        groupName = "customer";
                    }
        
                    await cognitoIdentityServiceProvider.adminAddUserToGroup({
                        GroupName: groupName,
                        UserPoolId: userPoolId,
                        Username: username,
                    }).promise();
        
                    return event;
                };
            `),
        });
    }
}