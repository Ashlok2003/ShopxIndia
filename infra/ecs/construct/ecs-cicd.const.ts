import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as events from 'aws-cdk-lib/aws-events';
import * as eventsTargets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import { Construct } from 'constructs';

export interface ECSCICDProps {
    service: ecs.IBaseService;
    containerName: string;

    repo: codecommit.IRepository;
    ecrRepo: ecr.IRepository;
    appPath: string;

    githubOauthTokenArn?: string;
    githubRepo?: string;
    githubBranch?: string;
    pipelineName?: string;

    dockerfileName?: string;
    buildCommands?: string[];

    enableNotifications?: boolean;
}

export class ECSCICDConstruct extends Construct {

    constructor(scope: Construct, id: string, props: ECSCICDProps) {
        super(scope, id);

        if (!props.service || !props.ecrRepo || !props.repo) {
            throw new Error("Service, ECR Repository, and CodeCommit Repository are required.");
        }

        const sourceOutput = new codepipeline.Artifact();
        const sourceAction = this.createSourceAction(props, sourceOutput);

        const buildOutput = new codepipeline.Artifact();
        const buildAction = this.createBuildAction(props, sourceOutput, buildOutput);

        const deployAction = new actions.EcsDeployAction({
            actionName: 'ECS_ContainerDeploy',
            service: props.service,
            imageFile: new codepipeline.ArtifactPath(buildOutput, 'imagedefinition.json'),
            deploymentTimeout: cdk.Duration.minutes(60)
        });

        const pipeline = new codepipeline.Pipeline(this, 'ECSServicePipeline', {
            pipelineName: props.pipelineName ?? `${cdk.Stack.of(this).stackName}-Pipeline`,
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
                    stageName: 'Deploy',
                    actions: [deployAction],
                }
            ]
        });

        if (props.enableNotifications) {
            this.createNotificationStage(pipeline);
        }
    }

    private createBuildAction(props: ECSCICDProps, sourceOutput: codepipeline.Artifact, buildOutput: codepipeline.Artifact): actions.CodeBuildAction {
        const buildProject = this.createBuildProject(props.ecrRepo, props);
        return new actions.CodeBuildAction({
            actionName: 'CodeBuild_DockerBuild',
            project: buildProject,
            input: sourceOutput,
            outputs: [buildOutput],
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
                            "pwd",
                            "printf '[{\"name\":\"%s\",\"imageUri\":\"%s\"}]' $CONTAINER_NAME $ECR_REPO_URI:$TAG > imagedefinitions.json",
                            "pwd; ls -al; cat imagedefinitions.json"
                        ]
                    }
                },
                artifacts: {
                    files: [`${appPath}/imagedefinitions.json`],
                },
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

    private createSourceAction(props: ECSCICDProps, sourceOutput: codepipeline.Artifact): actions.Action {
        const githubOauthToken = props.githubOauthTokenArn
            ? cdk.SecretValue.secretsManager(props.githubOauthTokenArn)
            : undefined;

        if (githubOauthToken) {

            return new actions.GitHubSourceAction({
                actionName: "GitHub_Source",
                owner: props.githubRepo?.split('/')[0] ?? "owner",
                repo: props.githubRepo?.split('/')[1] ?? "repo",
                oauthToken: githubOauthToken,
                output: sourceOutput,
                branch: props.githubBranch ?? "main",
            });
        }

        return new actions.CodeCommitSourceAction({
            actionName: "CodeCommit_Source",
            repository: props.repo,
            output: sourceOutput,
            branch: props.githubBranch ?? "main",
        });
    }

    private createNotificationStage(pipeline: codepipeline.Pipeline): void {
        const snsTopic = new sns.Topic(this, "PipelineNotification");

        new sns.Subscription(this, 'EmailSubscription', {
            topic: snsTopic,
            endpoint: "chaudharyashlok@gmail.com",
            protocol: sns.SubscriptionProtocol.EMAIL
        });

        const pipelineSuccessRule = new events.Rule(this, 'PipelineSuccessRule', {
            eventPattern: {
                source: ['aws.codepipeline'],
                detailType: ['CodePipeline Pipeline Execution State Change'],
                detail: {
                    pipeline: [pipeline.pipelineName],
                    state: ['SUCCEEDED'],
                }
            }
        });

        pipelineSuccessRule.addTarget(new eventsTargets.SnsTopic(snsTopic));

        snsTopic.grantPublish(new iam.ServicePrincipal('events.amazonaws.com'));
    }
}