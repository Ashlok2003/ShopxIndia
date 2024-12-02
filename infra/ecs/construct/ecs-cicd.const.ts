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
    githubOauthTokenArn?: string;
    githubRepo?: string;
    githubBranch?: string;
    pipelineName?: string;
}

export class ECSCICDConstruct extends Construct {

    constructor(scope: Construct, id: string, props: ECSCICDProps) {
        super(scope, id);

        if (!props.service || !props.ecrRepo || !props.repo) {
            throw new Error("Service, ECR Repository, and CodeCommit Repository are required.");
        }

        const githubOauthToken = props.githubOauthTokenArn
            ? cdk.SecretValue.secretsManager(props.githubOauthTokenArn)
            : undefined;

        const sourceOutput = new codepipeline.Artifact();

        const sourceAction = githubOauthToken
            ? new actions.GitHubSourceAction({
                actionName: "GitHub_Source",
                owner: props.githubRepo?.split('/')[0] ?? "owner",
                repo: props.githubRepo?.split('/')[1] ?? "repo",
                oauthToken: githubOauthToken,
                output: sourceOutput,
                branch: props.githubBranch ?? "main",
            })
            : new actions.CodeCommitSourceAction({
                actionName: "CodeCommit_Source",
                repository: props.repo,
                output: sourceOutput,
                branch: props.githubBranch ?? "main",
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
            imageFile: new codepipeline.ArtifactPath(buildOutput, 'imagedefinition.json'),
            deploymentTimeout: cdk.Duration.minutes(60)
        });

        new codepipeline.Pipeline(this, 'ECSServicePipeline', {
            pipelineName: props.pipelineName ?? `${cdk.Stack.of(this).stackName}-Pipeline`,
            enableKeyRotation: props.enableKeyRotation ?? true,
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
        const dockerfileName = props.dockerfileName ?? 'Dockerfile';

        const appPath = props.appPath || '.';

        const project = new codebuild.Project(this, 'DockerBuildProject', {
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
                            'echo Logging in to Amazon ECR...',
                            'aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REPO_URI',
                            'export TAG=latest',
                        ]
                    },
                    build: {
                        commands: [
                            `cd ${appPath}`,
                            'ls -la',
                            `docker build -f ${dockerfileName} -t $ECR_REPO_URI:$TAG .`,
                            'docker push $ECR_REPO_URI:$TAG',
                        ].concat(props.buildCommands ?? []),
                    },
                    post_build: {
                        commands: [
                            'echo Creating imagedefinitions.json file...',
                            "printf '[{\"name\":\"%s\",\"imageUri\":\"%s\"}]' $CONTAINER_NAME $ECR_REPO_URI:$TAG > imagedefinitions.json",
                            'cat imagedefinitions.json',
                        ]
                    }
                },
                artifacts: {
                    files: ['imagedefinitions.json'],
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