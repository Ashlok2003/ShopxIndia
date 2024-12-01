import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { OrderRequest } from '../interfaces/order';
import { SellerService } from './seller.service';

export class InterMessageService {
    private _connection: Connection | null = null;
    private _channel: Channel | null = null;

    private readonly URL: string;
    private readonly requestProcessingQueue = 'requestProcessingQueue';
    private sellerService: SellerService;

    constructor() {
        this.URL = process.env.RABBITMQ_URL ?? 'amqp://localhost';
        this.sellerService = new SellerService();
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.connect();
            await this.listenForProcessingRequests();
        } catch (error) {
            console.error('Failed to initialize InterMessageService:', error);
        }
    }

    private async connect(): Promise<void> {
        try {
            this._connection = await amqplib.connect(this.URL);
            console.log(`Connected to RabbitMQ at ${this.URL}`);
            this._channel = await this._connection.createChannel();
            console.log('RabbitMQ channel created.');
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            throw error;
        }
    }

    private async listenForProcessingRequests(): Promise<void> {
        if (!this._channel) {
            throw new Error('RabbitMQ channel is not initialized');
        }

        try {
            const queue = "seller_request_queue";

            await this._channel.assertQueue(queue, { durable: true });

            console.log(`Listening for messages on queue: ${this.requestProcessingQueue}`);

            this._channel.consume(queue, async (msg: ConsumeMessage | null) => {
                if (msg) {
                    try {
                        const processingData: OrderRequest = JSON.parse(msg.content.toString());
                        console.log('Received processing request:', processingData);

                        await this.handleProcessingRequest(processingData);
                        this._channel!.ack(msg);
                    } catch (error) {
                        console.error('Error processing request:', error);
                        this._channel!.nack(msg);
                    }
                }
            },
                { noAck: false }
            );
        } catch (error) {
            console.error('Error setting up message consumer:', error);
            throw error;
        }
    }

    private async handleProcessingRequest(processingData: OrderRequest): Promise<void> {
        try {
            // await this.sellerService.saveOrderId(processingData);
            console.log('Order processed successfully:', processingData);
        } catch (error) {
            console.error('Error processing order:', error);
            throw error;
        }
    }

    public async stopListening(): Promise<void> {
        try {
            if (this._channel) {
                await this._channel.close();
                console.log('RabbitMQ channel closed.');
            }

            if (this._connection) {
                await this._connection.close();
                console.log('RabbitMQ connection closed.');
            }
        } catch (error) {
            console.error('Error stopping RabbitMQ connection:', error);
        }
    }
}

export default new InterMessageService();
