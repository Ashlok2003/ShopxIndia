import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class PreTokenGenerationLambda extends Construct {
    public readonly lambdaFunction: lambda.Function;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.lambdaFunction = new lambda.Function(this, "PreTokenGenerationLambda", {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: "index.handler",
            code: lambda.Code.fromInline(`
                exports.handler = async (event) => {
                    // Permissions based on userType (Seller or Customer)
                    const userType = event.request.userAttributes['custom:userType'];
                    let permissions = [];
                    
                    if (userType === 'seller') {
                        permissions = [
                            'read:any_order', 'create:order', 'update:own_payment', 'admin'
                        ];
                    } else {
                        permissions = [
                            'read:own_order', 'create:order', 'update:own_payment'
                        ];
                    }

                    // Add custom claims to token
                    event.response = {
                        claimsOverrideDetails: {
                            claimsToAddOrOverride: {
                                "custom:permissions": JSON.stringify(permissions),
                                "custom:userType": userType
                            }
                        }
                    };

                    return event;
                }; 
            `),
        });
    }
}