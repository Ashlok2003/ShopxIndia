import amqplib, { Channel, Connection, ConsumeMessage } from "amqplib";
import { v4 as uuidv4 } from 'uuid';
import { ORDER_TYPE, OrderRequest } from "../interfaces/order";
import { PAYMENT_STATUS, PaymentRequest, PaymentResponse } from "../interfaces/payment";
import { Product } from "../interfaces/product";
import { Logger } from "../utils/logger";
import { OrderService } from "./order.service";

export class InterMessageService {
    private logger: Logger = Logger.getInstance({ serviceName: "InterMessageService", logLevel: "debug" });
    private _connection: Connection | null = null;
    private _channel: Channel | null = null;
    private readonly URI: string;
    private readonly orderReplyQueue: string = "order_reply_queue";
    private orderService: OrderService;

    constructor(orderService: OrderService) {
        this.URI = process.env.RABBITMQ_URL || "amqp://localhost";

        this.orderService = orderService;
        this.createConnection();
        this.listenForPaymentRequests();
    }


    private async createConnection(): Promise<void> {
        this._connection = await amqplib.connect(this.URI);
        this.logger.info("Connected to RabbitMQ.");

        this._channel = await this._connection.createChannel();
        this.logger.info("Channel created.");

        await this._channel.assertQueue(this.orderReplyQueue, { exclusive: false });
        this.logger.info(`Reply queue '${this.orderReplyQueue}' set up.`);

    }

    private async ensureChannel(): Promise<void> {
        if (!this._channel) {
            await this.createConnection();
        }
    }


    public async requestProductDetails(productIds: string[]): Promise<Product[] | undefined> {
        await this.ensureChannel();

        const requestQueue = "product_request_queue";

        const replyQueue = await this._channel!.assertQueue("", {
            exclusive: true,
            arguments: { 'x-message-ttl': 30000 } // TTL of 30 seconds
        });


        const correlationId = this.generateUUID();

        return new Promise((resolve, reject) => {
            const onMessage = (msg: ConsumeMessage | null) => {
                if (msg?.properties.correlationId === correlationId) {
                    try {
                        const productDetails = JSON.parse(msg.content.toString());
                        console.log(productDetails);
                        this.logger.info("Received product details:", productDetails);

                        this._channel!.ack(msg);
                        resolve(productDetails);
                    } catch (error) {
                        this.logger.error("Error parsing product details:", error);
                        reject(error);
                    }
                }
            };

            this._channel!.consume(replyQueue.queue, onMessage, { noAck: false });

            const request = { productIds };

            this._channel!.sendToQueue(requestQueue, Buffer.from(JSON.stringify(request)), {
                correlationId,
                replyTo: replyQueue.queue,
            });

        });
    }

    public async requestOrderConfirmationMail(orderDetails: OrderRequest): Promise<void> {
        await this.ensureChannel();

        const exchange = "order.request";
        const routingKey = "order.confirmation";

        try {
            await this._channel!.assertExchange(exchange, "direct", { durable: true });

            const message = JSON.stringify(orderDetails);
            this._channel!.publish(exchange, routingKey, Buffer.from(message), { persistent: true });

            console.log("Order Confirmation Mail Send : ", orderDetails);

        } catch (error) {
            this.logger.error("Failed to send order confirmation request:", error);
        }
    }

    public async listenForPaymentRequests(): Promise<void> {
        await this.ensureChannel();

        const queueName = "payment_order_queue";

        try {
            await this._channel!.assertQueue(queueName, { durable: true });
            this.logger.info(`Listening for payment requests on queue: ${queueName}`);

            this._channel!.consume(queueName, async (msg) => {
                if (msg) {

                    const paymentDetails: PaymentResponse = JSON.parse(msg.content.toString());

                    this.logger.info("Received Payment Request:", paymentDetails);
                    console.log(paymentDetails);

                    if (paymentDetails.type === PAYMENT_STATUS.SUCCESS) {
                        this.orderService.updatePaymentStatus(paymentDetails.data);

                        const { order, orderItems } = await this.orderService.getOrderDirect(paymentDetails.data.orderId);

                        await this.requestOrderConfirmationMail({
                            type: ORDER_TYPE.CONFIRMATION,
                            confirmationData: {
                                orderDate: order.createdAt,
                                orderId: order.orderId,
                                orderItems,
                                orderLink: "http://shopxindia.shop/orders",
                                totalAmount: order.totalAmount,
                                userId: order.userId,
                            }
                        });

                        await this.requestSellerAckAboutOrder(order.orderId);

                    } else if (paymentDetails.type === PAYMENT_STATUS.PENDING) {
                        this.orderService.updatePaymentStatus(paymentDetails.data);
                    }

                    this._channel!.ack(msg);
                }
            });
        } catch (error) {
            this.logger.error("Error listening for payment requests:", error);
        }
    }

    public async requestSellerAckAboutOrder(orderId: string): Promise<void> {
        await this.ensureChannel();

        try {

            const queue = "seller_request_queue";
            const { orderItems } = await this.orderService.getOrderDirect(orderId);

            const orderDetails = orderItems.map(item => ({ sellerId: item.sellerId, orderId }));
            const message = JSON.stringify(orderDetails);

            this._channel!.assertQueue(queue, { durable: true });
            this._channel!.sendToQueue(queue, Buffer.from(message), { persistent: true });

            this.logger.info("Order processing request sent to seller with message:", message);
        } catch (error) {
            this.logger.error("Failed to send order processing request to seller:", error);
        }
    }

    public async requestPaymentInitiation(orderDetails: PaymentRequest): Promise<void> {
        await this.ensureChannel();

        const queue = "order_request_queue";
        const message = JSON.stringify(orderDetails);

        try {

            this._channel!.assertQueue(queue, { durable: true });
            this._channel!.sendToQueue(queue, Buffer.from(message), { persistent: true });

            this.logger.info("Payment initiation request sent with details:", orderDetails);
        } catch (error) {
            this.logger.error("Failed to send payment initiation request:", error);
        }
    }

    private generateUUID(): string {
        return uuidv4();
    }

    async disconnect(): Promise<void> {
        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();
            this.logger.info("Disconnected from RabbitMQ.");
        } catch (error) {
            this.logger.error("Error during disconnection:", error);
        }
    }
}

