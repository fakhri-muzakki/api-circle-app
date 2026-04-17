import { Queue } from 'bullmq';
import { queueRedisConnection } from '../config/redis';

export const threadQueue = new Queue('thread-queue', {
  connection: queueRedisConnection,
});
