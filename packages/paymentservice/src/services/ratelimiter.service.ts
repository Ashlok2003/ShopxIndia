import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { Logger } from "../utils/logger";
import RedisCache from "../config/cache";

export class RateLimiter {
    private logger: Logger = Logger.getInstance();
    private rateLimiter: RateLimiterRedis;

    constructor() {
        const redisClient = RedisCache.getInstance();
        this.rateLimiter = new RateLimiterRedis({
            storeClient: redisClient,
            keyPrefix: 'order-service-rateLimiter',
            points: 100,
            duration: 60
        })
    }

    public async limit(ip: string): Promise<RateLimiterRes> {
        try {
            return await this.rateLimiter.consume(ip);
        } catch (error) {
            this.logger.error(`Rate limit error for IP: ${ip} with error: ${error}`);
            throw error;
        }
    }
}