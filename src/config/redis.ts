// src/config/redis.ts — tambahkan subscriber
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL!;

// Hanya dipake di queue
export const queueRedisConnection = new IORedis(redisUrl);

// Hanya dipake di socket
export const socketSubscriberRedis = new IORedis(redisUrl);

// Hanya dipake di worker
export const workerPublisherRedis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

// Hanya dipake di worker
export const bullmqWorkerRedis = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});
