import { createClient, RedisClientType } from 'redis';
import { Logger } from '../utils/logger';

class RedisCache {
    private static instance: RedisClientType | null = null;
    private static logger: Logger = Logger.getInstance();

    private constructor() { 
    }

    public static async getInstance(): Promise<RedisClientType> {
        if (!RedisCache.instance) {
            try {

                RedisCache.instance = createClient({
                    url: process.env.REDIS_URL!
                });

                RedisCache.instance.on('error', (err: Error) => {
                    console.error('Redis Client Error:', err);
                });

                await RedisCache.instance.connect();

            } catch (error: any) {
                throw new Error("Redis Connection Error: " + error.message);
            }
        }

        return RedisCache.instance;
    }

    public static async get(key: string): Promise<any> {
        try {
            const client = await RedisCache.getInstance();
            const value = await client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error: any) {
            this.logger.error(`Redis GET Error:', ${JSON.stringify(error.messages)}`);
            throw error;
        }
    }

    public static async set(key: string, value: any): Promise<void> {
        try {
            const client = await RedisCache.getInstance();
            await client.set(key, JSON.stringify(value));
        } catch (error: any) {
            this.logger.error(`Redis SET Error:', ${JSON.stringify(error.messages)}`);
            throw error;
        }
    }

    public static async del(key: string): Promise<void> {
        try {
            const client = await RedisCache.getInstance();
            await client.del(key);
        } catch (error: any) {
            this.logger.error(`Redis DELETE Error:', ${JSON.stringify(error.messages)}`);
            throw error;
        }
    }
}

export default RedisCache;
