import amqplib, { Channel, Connection, ConsumeMessage } from "amqplib";
import { Logger } from "../utils/logger";
import { ProductService } from "./product.service";

export class InterMessageService {
    private readonly URL: string;
    private productService: ProductService;
    private _channel: Channel | null = null;
    private _connection: Connection | null = null;
    private logger: Logger = Logger.getInstance({ serviceName: "InterMessageService", logLevel: "debug" });

    constructor() {
        this.URL = process.env.RABBITMQ_URL! || "amqp://localhost";
        this.productService = new ProductService();
        this.connect();
    }

    public async connect(): Promise<void> {
        try {
            const connection = await amqplib.connect(this.URL);
            this._connection = connection;
            this.logger.info("Product Service connected to RabbitMQ.");

            const channel = await connection.createChannel();
            this._channel = channel;
            this.logger.info("Channel created for Product Service.");

            this.listenForProductRequests();
        } catch (error) {
            this.logger.error("Failed to connect to RabbitMQ:", error);
        }
    }

    public listenForProductRequests(): void {
        const requestQueue = "product_request_queue";

        this._channel!.assertQueue(requestQueue, { durable: true })
            .then(() => {
                this.logger.info(`Listening for product requests on queue: ${requestQueue}`);

                this._channel!.consume(requestQueue, async (message) => {
                    if (message) {
                        try {
                            const { productIds } = JSON.parse(message.content.toString());
                            console.log(productIds);

                            const productDetails = await this.productService.getProductsByIds(productIds);
                            
                            this._channel!.sendToQueue(message.properties.replyTo, Buffer.from(JSON.stringify(productDetails)),
                                { correlationId: message.properties.correlationId }
                            );

                            this.logger.info("Request sent to order service");
                            this._channel!.ack(message);

                        } catch (err) {
                            this.logger.error("Error processing product request:", err);
                            this._channel!.nack(message, false, true);
                        }
                    }
                }, { noAck: false });
            })
            .catch((error) => {
                this.logger.error("Error while processing product requests:", error);
            });
    }

    public acknowledgeSeller(productDetails: object): void {
        const exchange = "product.request";
        const routingKey = "product_quantity_less";

        this._channel!.assertExchange(exchange, "direct", { durable: true })
            .then(() => {
                const message = JSON.stringify(productDetails);
                this._channel!.publish(exchange, routingKey, Buffer.from(message), { persistent: true });
                this.logger.info("Seller Ack request sent:", message);
            })
            .catch((error) => {
                this.logger.error("Failed to publish Seller Ack request message:", error);
            });
    }

    public async disconnect(): Promise<void> {
        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();
            this.logger.info("Product Service disconnected from RabbitMQ.");
        } catch (error) {
            this.logger.error("Error during disconnection:", error);
        }
    }
}

new InterMessageService();
