import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class UserPoolClientConfig extends Construct {
    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, userPool: cognito.UserPool) {
        super(scope, id);

        this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
            userPool,
            generateSecret: false,
            authFlows: {
                userPassword: true,
                userSrp: true
            },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true
                },
                scopes: [
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.EMAIL
                ]
            }
        });
    }
}