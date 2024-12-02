import { StackProps } from "aws-cdk-lib";

export interface CognitoProps extends StackProps {
    appName: string;
}