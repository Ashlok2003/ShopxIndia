import { Logger } from "../utils/logger";
import { Response, Request, NextFunction } from 'express';
import { RateLimiter } from "../services/ratelimiter.service";

const rateLimiter = new RateLimiter();
const logger: Logger = Logger.getInstance();

export const rateLimitMiddleware = (req: Request) => {
    
    return async (response: any) => {
        const ip = req.header('x-forwarded-for') || 'unknown';
        const rateLimitResult = await rateLimiter.limit(ip);

        if (rateLimitResult instanceof Error) {
            const retrySecs = Math.ceil(rateLimitResult.msBeforeNext / 1000);
            response.http.setHeader('Retry-After', retrySecs.toString());
            response.http.status(429);

            logger.warn(`Rate limit exceeded for IP: ${ip} : ${retrySecs}`);
        }

        response.http.setHeader('X-RateLimit-Limit', '100');
        response.http.setHeader('X-RateLimit-Remaining', (100 - rateLimitResult.remainingPoints).toString());
        response.http.setHeader('X-RateLimit-Reset', Math.ceil(rateLimitResult.msBeforeNext / 1000).toString());

        console.log("RATE LIMITER MIDDLEWARE HIT !");
        return response;
    }
}