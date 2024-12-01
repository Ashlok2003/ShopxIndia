import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
});

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