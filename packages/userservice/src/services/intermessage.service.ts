import amqp, { Channel, Connection } from "amqplib";
import { Subject } from "rxjs";
import { OTPRequest } from "../interfaces/request";
import { UserService } from "./user.service";
import { v4 as uuidv4 } from "uuid";
import CircuitBreaker from "opossum";

export class InterMessageService {
    private _connection: Connection | null = null;
    private _channel: Channel | null = null;
    private readonly URL: string;
    private readonly destroy$: Subject<void> = new Subject<void>();
    private readonly userService: UserService;

    constructor() {
        this.URL = process.env.RABBITMQ_URL || "amqp://localhost";
        this.connect();
        this.userService = new UserService();
    }

    async connect(): Promise<void> {
        try {
            this._connection = await amqp.connect(this.URL);
            this._channel = await this._connection.createChannel();
            this.serveUserResponse();
        } catch (error) {
            console.error("Failed to connect to RabbitMQ:", error);
            process.exit(1);
        }
    }

    async requestOTP(request: OTPRequest): Promise<void> {
        if (!this._channel) {
            throw new Error("Channel is not initialized. Call connect() first.");
        }

        const exchange = "user.request";
        const exchangeType = "fanout";

        try {
            await this._channel.assertExchange(exchange, exchangeType, { durable: true });

            const message = JSON.stringify(request);
            this._channel.publish(exchange, "", Buffer.from(message), { persistent: true });

            console.log("SENT: => ", message);
        } catch (error) {
            console.error("Failed to publish OTP request message:", error);
        }
    }

    async serveUserResponse(): Promise<void> {
        if (!this._channel) {
            throw new Error("Channel is not initialized. Call connect() first.");
        }

        const queue = "user.details.request";

        await this._channel.assertQueue(queue, { durable: true });

        this._channel.consume(queue, async (msg) => {
            if (msg) {
                const request = JSON.parse(msg.content.toString());

                const userId = request.userId;

                const { data } = await this.userService.getUserDetails(userId);

                this._channel?.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(data)),
                    {
                        correlationId: msg.properties.correlationId,
                        persistent: true,
                    }
                );

                console.log("Send: ", data);

                this._channel!.ack(msg);
            }
        });

    }

    async setupCircuitBreaker(): Promise<void> {

        const circuitBreakerOptions = {
            timeout: 5000,
            errorThresholdPercentage: 50,
            resetTimeout: 10000,
        };

        const otpBreaker = new CircuitBreaker(this.requestOTP.bind(this), circuitBreakerOptions);

        otpBreaker.fallback(() => {
            console.error("Circuit breaker: Falling back for OTP request");
        });

        otpBreaker.on("open", () => console.warn("Circuit breaker: OPEN - Requests will fail."));
        otpBreaker.on("halfOpen", () => console.warn("Circuit breaker: HALF-OPEN - Testing requests."));
        otpBreaker.on("close", () => console.info("Circuit breaker: CLOSED - Requests passing."));

    }

    async disconnect(): Promise<void> {
        this.destroy$.next();
        this.destroy$.complete();

        try {
            if (this._channel) await this._channel.close();
            if (this._connection) await this._connection.close();
            console.log("Disconnected from RabbitMQ.");
        } catch (error) {
            console.error("Error during disconnection:", error);
        }
    }

    private generateUUID(): string {
        return uuidv4();
    }
}

new InterMessageService();


