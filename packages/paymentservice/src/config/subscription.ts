import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const redis = new Redis(`${process.env.REDIS_URL!}`);

export const pubsub = new RedisPubSub({
    publisher: redis,
    subscriber: redis
});

/*

//! USERSERVICE
! ORDERSERVICE
//! NOTIFICATIONSERVICE
//! PRODUCTSERVICE
//! SELLERSERVICE
! PAYMENTSERVICE


*/