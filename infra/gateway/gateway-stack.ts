import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayIntegrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as apigatewayAuth from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as cognito from './construct/cognito-const';
import { CognitoProps } from './construct/cognito.props';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export interface GatewayStackProps extends cdk.StackProps {
    apiKey: string;
    cloudNamespace: servicediscovery.PrivateDnsNamespaceAttributes;
    vpc: ec2.IVpc;
    cognitoProps: CognitoProps;
}

export class GatewayStack extends cdk.Stack {
    public readonly gatewayUrl: string;

    constructor(scope: Construct, id: string, props: GatewayStackProps) {
        super(scope, id, props);

        const gatewayFunction = new lambda.Function(this, 'FedrationGateway', {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: 'server.handler',
            code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas')),
            environment: {
                NAMESPACE_NAME: props.cloudNamespace.namespaceName,
                API_KEY: props.apiKey,
            },
            vpc: props.vpc,
        });

        const namespace = servicediscovery.PrivateDnsNamespace.fromPrivateDnsNamespaceAttributes(this, 'Namespace', {
            namespaceName: props.cloudNamespace.namespaceName,
            namespaceId: props.cloudNamespace.namespaceId,
            namespaceArn: props.cloudNamespace.namespaceArn
        });

        const cognitoResources = new cognito.Cognito(this, 'Cognito', props.cognitoProps);
        const cognitoUserPool = cognitoResources.userPool;

        const cognitoAuthorizer = new apigatewayAuth.HttpUserPoolAuthorizer('CognitoAuthorizer', cognitoUserPool, {
            userPoolClients: [cognitoResources.userPoolClient],
            identitySource: ['$request.header.Authorization']
        });

        const api = new apigateway.HttpApi(this, 'GraphQLApi', {
            defaultIntegration: new apigatewayIntegrations.HttpLambdaIntegration('LambdaIntegration', gatewayFunction),
            defaultAuthorizer: cognitoAuthorizer,
        });

        this.gatewayUrl = api.url!;
    }
}
