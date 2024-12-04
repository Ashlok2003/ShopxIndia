import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface ECSRepoProps {
    shortStackName: string;
}

export class ECSRepoConstruct extends Construct {
    public gitRepo: codecommit.Repository;
    public ecrRepo: ecr.Repository;

    constructor(scope: Construct, id: string, props: ECSRepoProps) {
        super(scope, id);

        const repoSuffix = 'repo';

        this.gitRepo = new codecommit.Repository(this, `${props.shortStackName}Repository`, {
            repositoryName: `${props.shortStackName}-${repoSuffix}`.toLowerCase(),
            description: props.shortStackName
        });

        new cdk.CfnOutput(this, `${props.shortStackName}CodeCommitName`, {
            value: this.gitRepo.repositoryName,
            description: 'The name of the CodeCommit repository',
            exportName: `${props.shortStackName}-CodeCommitName`,
        });

        try {
            this.ecrRepo = ecr.Repository.fromRepositoryName(this, `${props.shortStackName}ExistingEcrRepository`, `${props.shortStackName}-${repoSuffix}`.toLowerCase()) as ecr.Repository;
            
        } catch (error) {
            
            this.ecrRepo = new ecr.Repository(this, `${props.shortStackName}EcrRepository`, {
                repositoryName: `${props.shortStackName}-${repoSuffix}`.toLowerCase(),
                lifecycleRules: [{ maxImageAge: cdk.Duration.days(30) }],
            });
        }

        new cdk.CfnOutput(this, `${props.shortStackName}ECRName`, {
            value: this.ecrRepo.repositoryName,
            description: 'The name of the ECR repository',
            exportName: `${props.shortStackName}-ECRName`,
        });
    }
}
