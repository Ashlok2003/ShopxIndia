import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { CognitoProps } from "./cognito.props";
import { PostConfirmationLambda } from "../lambdas/post.confirmation";
import { UserPoolConfig } from "./userpool.config";
import { UserPoolClientConfig } from "./userpoolclient";
import { UserPoolGroups } from "./userpoolgroup";
import { PreTokenGenerationLambda } from "../lambdas/pre.confirmation";

export class Cognito extends Construct {

    public readonly userPool: cognito.UserPool;
    public readonly userPoolClient: cognito.UserPoolClient;
    public readonly postConfirmationLambda: lambda.Function;
    public readonly preTokenLambda: lambda.Function;

    constructor(scope: Construct, id: string, props: CognitoProps) {
        super(scope, id);

        const userPoolConfig = new UserPoolConfig(this, "UserPoolConfig", props);
        this.userPool = userPoolConfig.userPool;

        new UserPoolGroups(this, "UserPoolGroups", this.userPool.userPoolId);

        const processingLambda = new PostConfirmationLambda(this, "PostConfirmationLambda");
        this.postConfirmationLambda = processingLambda.lambdaFunction;
        
        this.userPool.addTrigger(cognito.UserPoolOperation.POST_CONFIRMATION, this.postConfirmationLambda);

        const preTokenLambda = new PreTokenGenerationLambda(this, "PreTokenGenerationLambda");
        this.preTokenLambda = preTokenLambda.lambdaFunction;
        
        this.userPool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, this.preTokenLambda);

        const userPoolClientConfig = new UserPoolClientConfig(this, "UserPoolClientConfig", this.userPool);
        this.userPoolClient = userPoolClientConfig.userPoolClient;
    }

}