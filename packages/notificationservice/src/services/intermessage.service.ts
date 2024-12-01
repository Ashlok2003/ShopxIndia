import amqplib, { Channel, Connection, ConsumeMessage } from 'amqplib';
import { v4 as uuidv4 } from "uuid";
import { ORDER_TYPE, OrderRequest } from '../interfaces/order';
import { PAYMENT_TYPE, PaymentRequest } from '../interfaces/payment';
import { LowStockNotificationData } from '../interfaces/seller';
import { OTPRequest, UserResponse } from '../interfaces/user';
import { Logger } from '../utils/logger';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { SellerService } from './seller.service';
import { UserService } from './user.service';

export class InterMessageService {
    private _connection: Connection | null = null;
    private _channel: Channel | null = null;
    private readonly URI: string;

    private logger: Logger = Logger.getInstance({ serviceName: "NotificationService", logLevel: "debug" });

    private userService: UserService;
    private orderService: OrderService;
    private sellerService: SellerService;
    private paymentService: PaymentService;

    constructor() {
        this.userService = new UserService();
        this.orderService = new OrderService();
        this.sellerService = new SellerService();
        this.paymentService = new PaymentService();

        this.URI = process.env.RABBITMQ_URL || 'amqp://localhost';

        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.connect();
            await this.startListening();
        } catch (err) {
            this.logger.error('Critical error during initialization:', err);
        }
    }

    private async connect(): Promise<void> {
        try {
            this._connection = await amqplib.connect(this.URI);
            this.logger.info(`Connected to RabbitMQ at ${this.URI}`);

            this._channel = await this._connection.createChannel();
            this.logger.info('RabbitMQ channel established.');
        } catch (error) {
            this.logger.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    private async ensureChannel(): Promise<void> {
        if (!this._channel) {
            await this.connect();
        }
    }

    private async setupConsumer({ exchange, queue, routingKey, exchangeType = 'direct', onMessage }: {
        exchange: string;
        queue: string;
        routingKey: string;
        exchangeType?: string;
        onMessage: (message: ConsumeMessage) => Promise<void>;
    }): Promise<void> {
        try {
            await this.ensureChannel();
            await this._channel!.assertExchange(exchange, exchangeType, { durable: true });
            await this._channel!.assertQueue(queue, { durable: true });
            await this._channel!.bindQueue(queue, exchange, routingKey);

            this._channel!.consume(queue, async (message) => {
                if (message) {
                    try {
                        await onMessage(message);
                        this._channel!.ack(message);
                    } catch (error) {
                        this.logger.error('Error processing message:', error);
                        this._channel!.nack(message, false, true);
                    }
                }
            });

            this.logger.info(`Consumer setup for exchange: "${exchange}", queue: "${queue}", routingKey: "${routingKey}"`);
        } catch (error) {
            this.logger.error('Error setting up consumer:', error);
        }
    }

    public async requestUserDetails(request: { userId: string }): Promise<UserResponse> {
        await this.ensureChannel();

        const requestQueue = "user.details.request";
        const replyQueue = await this._channel!.assertQueue("", { exclusive: true });

        const correlationId = this.generateUUID();
        const message = JSON.stringify(request);

        return new Promise((resolve, reject) => {

            const onMessage = (msg: ConsumeMessage | null) => {
                if (msg?.properties.correlationId === correlationId) {
                    try {
                        const response: UserResponse = JSON.parse(msg.content.toString());
                        this.logger.info("Received user details response:", response);

                        this._channel!.ack(msg);
                        resolve(response);
                    } catch (error) {
                        this.logger.error("Error parsing user details response:", error);
                        reject(error);
                    }
                }
            };

            try {

                this._channel!.sendToQueue(requestQueue, Buffer.from(message), {
                    correlationId,
                    replyTo: replyQueue.queue,
                    persistent: true,
                });

                this.logger.info("User details request sent:", request);

                this._channel!.consume(replyQueue.queue, onMessage, { noAck: false });
            } catch (error) {
                this.logger.error("Failed to send user details request:", error);
                reject(error);
            }
        });
    }


    private generateUUID(): string {
        return uuidv4();
    }

    private async startListening(): Promise<void> {
        //! User Requests 
        this.setupConsumer({
            exchange: 'user.request',
            queue: 'user_request_queue',
            routingKey: '',
            exchangeType: 'fanout',
            onMessage: async (message) => {
                const userDetails: OTPRequest = JSON.parse(message.content.toString());
                this.logger.info('Sending OTP notification to User:', userDetails);
                await this.userService.sendOTP(userDetails);
            },
        });

        //! Payment Requests
        this.setupConsumer({
            exchange: 'payment.request',
            queue: 'payment_mail_queue',
            routingKey: 'payment_confirmation',
            onMessage: async (message) => {
                const paymentDetails: PaymentRequest = JSON.parse(message.content.toString());
                this.logger.info('Receiving Payment Details:', paymentDetails);
                console.log(paymentDetails);

                if (paymentDetails.type === PAYMENT_TYPE.CANCELLATION) {
                    const userDetails: UserResponse = await this.requestUserDetails({ userId: paymentDetails.userId });
                    await this.paymentService.sendPaymentCancellationMail(paymentDetails, userDetails);
                } else if (paymentDetails.type === PAYMENT_TYPE.CONFIRMATION) {
                    const userDetails: UserResponse = await this.requestUserDetails({ userId: paymentDetails.userId });
                    await this.paymentService.sendPaymentConfirmationMail(paymentDetails, userDetails);
                }
            },
        });

        //! Order Requests
        this.setupConsumer({
            exchange: 'order.request',
            queue: 'order_confirmation_queue',
            routingKey: 'order.confirmation',
            onMessage: async (message) => {
                const orderDetails: OrderRequest = JSON.parse(message.content.toString());
                this.logger.info('Sending order confirmation email to User:', orderDetails);
                console.log(orderDetails);

                if (orderDetails.type === ORDER_TYPE.CANCELLATION) {
                    const userDetails: UserResponse = await this.requestUserDetails({ userId: orderDetails.cancellationData?.userId! });
                    await this.orderService.sendOrderCancellationMail(orderDetails.cancellationData!, userDetails);
                } else if (orderDetails.type === ORDER_TYPE.CONFIRMATION) {
                    console.log("Confirmation MAIL: ");
                    const userDetails: UserResponse = await this.requestUserDetails({ userId: orderDetails.confirmationData?.userId! });
                    console.log(userDetails);
                    await this.orderService.sendOrderConfirmationMail(orderDetails.confirmationData!, userDetails);
                }
            },
        });

        //! Product Requests
        this.setupConsumer({
            exchange: 'product.request',
            queue: 'product_queue',
            routingKey: 'product_quantity_less',
            onMessage: async (message) => {
                const sellerDetails: LowStockNotificationData = JSON.parse(message.content.toString());
                this.logger.info('Sending low stock notification to Seller:', sellerDetails);
                await this.sellerService.sendSellerAckMail(sellerDetails);
            },
        });
    }

    async disconnect(): Promise<void> {
        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();

            this.logger.info('Disconnected from RabbitMQ.');
        } catch (error) {
            this.logger.error('Error during disconnection:', error);
        }
    }
}

new InterMessageService();
