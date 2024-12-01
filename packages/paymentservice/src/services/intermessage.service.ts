import amqplib, { Channel, Connection, ConsumeMessage } from "amqplib";
import { ORDER_PAYMENT_STATUS, OrderPaymentResponse } from "../interfaces/order";
import { CreatePaymentInput, PaymentRequest } from "../interfaces/payment";
import { QRService } from "./qr.service";

export class InterPaymentMessageService {
    private _connection: Connection | null = null;
    private _channel: Channel | null = null;
    private readonly URL: string;
    private readonly paymentService: QRService;

    constructor(paymentService: QRService) {
        this.paymentService = paymentService;
        this.URL = process.env.RABBITMQ_URL || "amqp://localhost";
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            await this.connect();
            await this.listenForOrderRequest();
        } catch (error) {
            console.error("Failed to initialize InterPaymentMessageService:", error);
        }
    }

    private async connect(): Promise<void> {
        try {
            this._connection = await amqplib.connect(this.URL);
            console.log("RabbitMQ connection established.");

            this._channel = await this._connection.createChannel();
            console.log("RabbitMQ channel created.");
        } catch (error) {
            console.error("Failed to connect to RabbitMQ:", error);
            throw error;
        }
    }

    private async ensureChannel(): Promise<void> {
        if (!this._channel) {
            await this.connect();
        }
    }

    private async publishMessage({
        exchange,
        routingKey,
        message,
        options = {},
    }: {
        exchange: string;
        routingKey: string;
        message: string;
        options?: Record<string, any>;
    }): Promise<void> {
        try {
            if (!this._channel) {
                throw new Error("Channel is not initialized.");
            }

            await this._channel.assertExchange(exchange, "direct", { durable: true });
            this._channel.publish(exchange, routingKey, Buffer.from(message), options);
            console.log(`Message published to exchange '${exchange}' with routingKey '${routingKey}':`, message);
        } catch (error) {
            console.error("Error publishing message:", error);
            throw error;
        }
    }

    private async listenForOrderRequest(): Promise<void> {
        await this.ensureChannel();

        const queue = "order_request_queue";
        try {
            await this._channel!.assertQueue(queue, { durable: true });
            console.log(`Listening for messages in queue: ${queue}`);

            this._channel!.consume(queue, async (message) => {
                if (message) {
                    try {
                        const orderDetails: CreatePaymentInput = JSON.parse(message.content.toString());

                        const paymentDetails = await this.paymentService.inititePaymentProcess(orderDetails);

                        const paymentResponse: OrderPaymentResponse = {
                            type: ORDER_PAYMENT_STATUS.PENDING,
                            data: {
                                orderId: paymentDetails.orderId,
                                paymentId: paymentDetails.paymentId,
                                paymentStatus: ORDER_PAYMENT_STATUS.PENDING,
                            },
                        };

                        await this.responsePaymentStatusToOrder(paymentResponse);

                        this._channel!.ack(message);
                    } catch (error) {
                        console.error("Error processing order request:", error);
                        this._channel!.nack(message, false, true);
                    }
                }
            });
        } catch (error) {
            console.error("Error while setting up message listener:", error);
        }
    }

    public async requestPaymentConfirmationMail(paymentDetails: PaymentRequest): Promise<void> {
        await this.ensureChannel();

        const exchange = "payment.request";
        const queue = "payment_mail_queue";
        const routingKey = "payment_confirmation";
        const message = JSON.stringify(paymentDetails);

        try {
            await this._channel!.assertExchange(exchange, "direct", { durable: true });
            await this._channel!.assertQueue(queue, { durable: true });
            await this._channel!.bindQueue(queue, exchange, routingKey);

            this._channel!.publish(exchange, routingKey, Buffer.from(message), { persistent: true });
            console.log("Payment confirmation request sent:", message);
        } catch (error) {
            console.error("Failed to send payment confirmation:", error);
        }
    }

    public async responsePaymentStatusToOrder(paymentDetails: OrderPaymentResponse): Promise<void> {
        await this.ensureChannel();

        const queue = "payment_order_queue";
        const exchange = "payment_exchange";
        const routingKey = "payment_status";
        const message = JSON.stringify(paymentDetails);

        try {
            await this._channel!.assertExchange(exchange, "direct", { durable: true });
            await this._channel!.assertQueue(queue, { durable: true });
            await this._channel!.bindQueue(queue, exchange, routingKey);

            this._channel!.publish(exchange, routingKey, Buffer.from(message), { persistent: true });

            console.log("Payment status sent:", paymentDetails);
        } catch (error) {
            console.error("Error sending payment status:", error);
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();
            console.log("Disconnected from RabbitMQ.");
        } catch (error) {
            console.error("Error during disconnection:", error);
        }
    }
}

(async () => {
    const qrService = new QRService();
    const service = new InterPaymentMessageService(qrService);
})();
