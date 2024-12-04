import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as lb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';


const REFRESH_PERIOD_IN_MIN: number = 1;
const METRIC_PERIOD_IN_SEC: number = 60;

export interface ServiceConfig {
    serviceName: string;
    ecsService: ecs.FargateService;
    alb: lb2.ApplicationLoadBalancer;
    alarmThreshold: number;
    subscriptionEmails: string[];
}

export interface EcsMultiServiceMonitorProps {
    stackName: string;
    services: ServiceConfig[];
    centralizedDashboard?: boolean;
}

export class ECSAlbMultiServiceMonitorConstruct extends Construct {
    private dashboards: { [key: string]: cloudwatch.Dashboard } = {};
    private props: EcsMultiServiceMonitorProps;

    constructor(scope: Construct, id: string, props: EcsMultiServiceMonitorProps) {
        super(scope, id);
        this.props = props;

        if (props.centralizedDashboard) {
            this.dashboards['central'] = new cloudwatch.Dashboard(this, 'CentralDashboard', {
                dashboardName: `${props.stackName}-CentralDashboard`,
            });
        }

        props.services.forEach((serviceConfig) => this.createServiceMonitoring(serviceConfig));
    }

    private createServiceMonitoring(serviceConfig: ServiceConfig): void {
        const dashboard = this.props.centralizedDashboard
            ? this.dashboards['central']
            : new cloudwatch.Dashboard(this, `${serviceConfig.serviceName}Dashboard`, {
                dashboardName: `${this.props.stackName}-${serviceConfig.serviceName}-Dashboard`,
            });

        const metricOptions: cloudwatch.MetricOptions = {
            period: cdk.Duration.seconds(METRIC_PERIOD_IN_SEC),
        };

        dashboard.addWidgets(new cloudwatch.SingleValueWidget({
            title: `${serviceConfig.serviceName}-ALB-Requests`,
            metrics: [
                serviceConfig.alb.metrics.requestCount(metricOptions),
                serviceConfig.alb.metrics.httpCodeTarget(lb2.HttpCodeTarget.TARGET_2XX_COUNT, metricOptions),
                serviceConfig.alb.metrics.httpCodeTarget(lb2.HttpCodeTarget.TARGET_3XX_COUNT, metricOptions),
                serviceConfig.alb.metrics.httpCodeTarget(lb2.HttpCodeTarget.TARGET_4XX_COUNT, metricOptions),
                serviceConfig.alb.metrics.httpCodeTarget(lb2.HttpCodeTarget.TARGET_5XX_COUNT, metricOptions),
            ],
            width: 24,
        }));

        dashboard.addWidgets(
            this.createWidget(`${serviceConfig.serviceName}-ALB-Response`, [
                serviceConfig.alb.metrics.targetResponseTime(metricOptions),
            ]),
        );

        dashboard.addWidgets(
            this.createWidget(`${serviceConfig.serviceName}-ECS-CPU`, [
                serviceConfig.ecsService.metricCpuUtilization(metricOptions),
            ]),
            this.createWidget(`${serviceConfig.serviceName}-ECS-Memory`, [
                serviceConfig.ecsService.metricMemoryUtilization(metricOptions),
            ]),
        );

        this.createAlarms(serviceConfig);
    }

    private createWidget(name: string, metrics: cloudwatch.IMetric[]): cloudwatch.GraphWidget {
        return new cloudwatch.GraphWidget({
            title: name,
            left: metrics,
            width: 24,
            period: cdk.Duration.minutes(REFRESH_PERIOD_IN_MIN),
        });
    }

    private createAlarms(serviceConfig: ServiceConfig): void {
        const alarmTopic = new sns.Topic(this, `${serviceConfig.serviceName}-Alarm-Topic`, {
            displayName: `${this.props.stackName}-${serviceConfig.serviceName}-Alarm-Topic`,
            topicName: `${this.props.stackName}-${serviceConfig.serviceName}-Alarm-Topic`
        });

        serviceConfig.subscriptionEmails.forEach((email) =>
            alarmTopic.addSubscription(new subscriptions.EmailSubscription(email)),
        );

        const alarm = serviceConfig.alb.metrics.requestCount().createAlarm(this, `${serviceConfig.serviceName}-Alarm`, {
            alarmName: `${this.props.stackName}-${serviceConfig.serviceName}-Alarm`,
            threshold: serviceConfig.alarmThreshold,
            evaluationPeriods: 3,
            actionsEnabled: true,
            alarmDescription: `This alarm occurs when request-count exceeds ${serviceConfig.alarmThreshold}.`,
        });

        alarm.addAlarmAction(new cw_actions.SnsAction(alarmTopic));
    }
}