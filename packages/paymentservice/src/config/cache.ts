import Redis, { Redis as RedisInstance } from "ioredis";
import { Logger } from "../utils/logger";

class RedisCache {
    private static instance: RedisInstance | null = null;
    private static logger: Logger = Logger.getInstance({ serviceName: "RedisCache", logLevel: "debug" });
    private static readonly DEFAULT_EXPIRATION = 3600;

    private constructor() {}

    public static async getInstance(): Promise<RedisInstance> {
        if (!RedisCache.instance) {
            try {
                RedisCache.instance = new Redis(process.env.REDIS_URL!);

                RedisCache.instance.on("error", (err: Error) => {
                    this.logger.error("Redis Client Error:", err);
                });

                this.logger.info("Connected to Redis successfully.");
            } catch (error: any) {
                throw new Error("Redis Connection Error: " + error.message);
            }
        }

        return RedisCache.instance;
    }

    public static async get<T>(key: string): Promise<T | null> {
        try {
            const client = await RedisCache.getInstance();
            const value = await client.get(key);
            return value ? (JSON.parse(value) as T) : null;
        } catch (error: any) {
            this.logger.error(`Redis GET Error for key '${key}': ${error.message}`);
            throw error;
        }
    }

    public static async set<T>(key: string, value: T, expiration?: number): Promise<void> {
        try {
            const client = await RedisCache.getInstance();
            const ttl = expiration || RedisCache.DEFAULT_EXPIRATION;
            await client.set(key, JSON.stringify(value), "EX", ttl);
            this.logger.info(`Key '${key}' set in Redis with TTL ${ttl} seconds.`);
        } catch (error: any) {
            this.logger.error(`Redis SET Error for key '${key}': ${error.message}`);
            throw error;
        }
    }

    public static async del(key: string): Promise<void> {
        try {
            const client = await RedisCache.getInstance();
            await client.del(key);
            this.logger.info(`Key '${key}' deleted from Redis.`);
        } catch (error: any) {
            this.logger.error(`Redis DELETE Error for key '${key}': ${error.message}`);
            throw error;
        }
    }

    public static async exists(key: string): Promise<boolean> {
        try {
            const client = await RedisCache.getInstance();
            const exists = await client.exists(key);
            return exists === 1;
        } catch (error: any) {
            this.logger.error(`Redis EXISTS Error for key '${key}': ${error.message}`);
            throw error;
        }
    }

    public static async close(): Promise<void> {
        if (RedisCache.instance) {
            try {
                await RedisCache.instance.quit();
                RedisCache.instance = null;
                this.logger.info("Redis client connection closed.");
            } catch (error: any) {
                this.logger.error(`Error closing Redis client connection: ${error.message}`);
                throw error;
            }
        }
    }

    public static async getKeysByPattern(pattern: string): Promise<string[]> {
        try {
            const client = await RedisCache.getInstance();
            const keys = await client.keys(pattern);
            return keys;
        } catch (error: any) {
            this.logger.error(`Redis KEYS Error for pattern '${pattern}': ${error.message}`);
            throw error;
        }
    }
}

export default RedisCache;
