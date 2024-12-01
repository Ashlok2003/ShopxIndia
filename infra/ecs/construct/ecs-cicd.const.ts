import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface ECSCICDProps {
    service: ecs.IBaseService;
    containerName: string;
    repo: codecommit.IRepository;
    ecrRepo: ecr.IRepository;
    appPath: string;
    dockerfileName?: string;
    buildCommands?: string[];
    enableKeyRotation?: boolean;
}

export class ECSCICDConstruct extends Construct {

    constructor(scope: Construct, id: string, props: ECSCICDProps) {
        super(scope, id);

        const sourceOutput = new codepipeline.Artifact();
        const sourceAction = new actions.CodeCommitSourceAction({
            actionName: 'CodeCommit_SourceMerge',
            repository: props.repo,
            output: sourceOutput,
            branch: 'master'
        });

        const buildOutput = new codepipeline.Artifact();
        const buildAction = new actions.CodeBuildAction({
            actionName: 'CodeBuild_DockerBuild',
            project: this.createBuildProject(props.ecrRepo, props),
            input: sourceOutput,
            outputs: [buildOutput]
        });

        const approvalAction = new actions.ManualApprovalAction({
            actionName: 'Manual_Approve',
        });

        const deployAction = new actions.EcsDeployAction({
            actionName: 'ECS_ContainerDeploy',
            service: props.service,
            imageFile: new codepipeline.ArtifactPath(buildOutput, (props.appPath ? `${props.appPath}/imagedefinitions.json` : 'imagedefinition.json'),),
            deploymentTimeout: cdk.Duration.minutes(60)
        });

        new codepipeline.Pipeline(this, 'ECSServicePipeline', {
            pipelineName: `${cdk.Stack.of(this)}-Pipeline`,
            enableKeyRotation: props.enableKeyRotation ? props.enableKeyRotation : true,
            stages: [
                {
                    stageName: 'Source',
                    actions: [sourceAction],
                },
                {
                    stageName: 'Build',
                    actions: [buildAction],
                },
                {
                    stageName: 'Approve',
                    actions: [approvalAction],
                },
                {
                    stageName: 'Deploy',
                    actions: [deployAction],
                }
            ]
        });

    }

    private createBuildProject(ecrRepo: ecr.IRepository, props: ECSCICDProps): codebuild.Project {
        const buildCommandsBefore = [
            'echo "In Build Phase"',
            'cd $APP_PATH',
            'ls -l',
        ];

        const buildCommandsAfter = [
            `$(aws ecr get-login --no-inclue-email)`,
            `docker build -f ${props.dockerfileName ? props.dockerfileName : 'Dockerfile'} - t $ECR_REPO_URI:$TAG .`,
            'docker push $ECR_REPO_URI:$TAG'
        ];

        const appPath = props.appPath ? `${props.appPath}` : ".";

        const project = new codebuild.Project(this, 'DockerBuild', {
            environment: {
                buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_4,
                computeType: codebuild.ComputeType.SMALL,
                privileged: true
            },
            environmentVariables: {
                'ECR_REPO_URI': {
                    value: `${ecrRepo.repositoryUri}`
                },
                'CONTAINER_NAME': {
                    value: `${props.containerName}`
                },
                'APP_PATH': {
                    value: appPath
                }
            },
            buildSpec: codebuild.BuildSpec.fromObject({
                version: "0.2",
                phases: {
                    pre_build: {
                        commands: [
                            'echo In Pre-Build Phase',
                            'export TAG=latest',
                            `echo $TAG`
                        ]
                    },
                    build: {
                        commands: [
                            ...buildCommandsBefore,
                            ...(props.buildCommands ? props.buildCommands : []),
                            ...buildCommandsAfter
                        ]
                    },
                    post_build: {
                        commands: [
                            'echo "In Post-Build Phase"',
                            'pwd',
                            "printf '[{\"name\":\"%s\",\"imageUri\":\"%s\"}]' $CONTAINER_NAME $ECR_REPO_URI:$TAG > imagedefinitions.json",
                            "pwd; ls -al; cat imagedefinitions.json"
                        ]
                    }
                },
                artifacts: {
                    files: [
                        `${appPath}/imagedefinitions.json`
                    ]
                }
            }),
        });

        ecrRepo.grantPullPush(project.role!);
        this.appendECRReadPolicy('build-policy', project.role!);

        return project;
    }

    private appendECRReadPolicy(baseName: string, role: iam.IRole) {
        const statement = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage"
            ]
        });

        const policy = new iam.Policy(this, baseName);
        policy.addStatements(statement);

        role.attachInlinePolicy(policy);
    }
}