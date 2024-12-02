import * as cognito from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";
import { CognitoProps } from "./cognito.props";

export class UserPoolConfig extends Construct {
    public readonly userPool: cognito.UserPool;

    constructor(scope: Construct, id: string, props: CognitoProps) {
        super(scope, id);

        this.userPool = new cognito.UserPool(this, "UserPool", {
            userPoolName: `${props.appName}-user-pool`,
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            mfa: cognito.Mfa.OPTIONAL,
            autoVerify: { email: true },
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireDigits: true,
                requireSymbols: false
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            customAttributes: {
                permissions: new cognito.StringAttribute({ mutable: true }),
                userType: new cognito.StringAttribute({ mutable: true })
            }
        });
    }
}