import {
    CloudWatchLogsClient,
    CreateLogStreamCommand,
    DescribeLogStreamsCommand,
    PutLogEventsCommand,
} from '@aws-sdk/client-cloudwatch-logs';
import TransportStream from 'winston-transport';

interface CloudWatchTransportOptions {
    logGroupName: string;
    logStreamName?: string;
    awsRegion: string;
    retryLimit?: number;
    retryDelay?: number;
}

export class CloudWatchTransport extends TransportStream {
    private logGroupName: string;
    private logStreamName: string;
    private retryLimit: number;
    private retryDelay: number;
    private sequenceToken?: string;
    private cloudWatchLogsClient: CloudWatchLogsClient;

    constructor(options: CloudWatchTransportOptions) {
        super();
        this.retryLimit = options.retryLimit || 3;
        this.retryDelay = options.retryDelay || 3000;
        this.logGroupName = options.logGroupName;
        this.logStreamName = options.logStreamName || 'DEFAULT_LOG_STREAM';
        this.cloudWatchLogsClient = new CloudWatchLogsClient({ region: options.awsRegion });
    }

    async log(info: any, callback: () => void): Promise<void> {
        const { message, level } = info;
        const logEvent = {
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
            logEvents: [
                {
                    message: JSON.stringify({ level, message }),
                    timestamp: Date.now(),
                },
            ],
        };

        try {
            await this.retry(() => this.ensureLogStreamExists());
            await this.retry(() => this.sendLogEvent(logEvent));
        } catch (error) {
            console.error('Failed to send log event to CloudWatch:', error);
        } finally {
            callback();
        }
    }

    private async retry<T>(fn: () => Promise<T>, attempt: number = 0): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (attempt < this.retryLimit) {
                console.warn(`Retry attempt ${attempt + 1} failed. Retrying...`);
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
                return this.retry(fn, attempt + 1);
            } else {
                throw error;
            }
        }
    }

    private async ensureLogStreamExists(): Promise<void> {
        try {
            const describeCommand = new DescribeLogStreamsCommand({
                logGroupName: this.logGroupName,
                logStreamNamePrefix: this.logStreamName,
            });

            const response = await this.cloudWatchLogsClient.send(describeCommand);
            const logStream = response.logStreams?.find(
                (stream: any) => stream.logStreamName === this.logStreamName
            );

            if (logStream) {
                this.sequenceToken = logStream.uploadSequenceToken;
            } else {
                const createCommand = new CreateLogStreamCommand({
                    logGroupName: this.logGroupName,
                    logStreamName: this.logStreamName,
                });

                await this.cloudWatchLogsClient.send(createCommand);
            }
        } catch (error) {
            console.error('Failed to ensure log stream exists:', error);
            throw error;
        }
    }

    private async sendLogEvent(logEvent: any): Promise<void> {
        try {
            if (this.sequenceToken) {
                logEvent.sequenceToken = this.sequenceToken;
            }

            const command = new PutLogEventsCommand(logEvent);
            const response = await this.cloudWatchLogsClient.send(command);
            this.sequenceToken = response.nextSequenceToken;
        } catch (error) {
            console.error('Failed to send log event to CloudWatch:', error);
            throw error;
        }
    }
}
