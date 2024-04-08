import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const redisUri = process.env.REDIS_URI;

if (!redisUri) {
  throw new Error('REDIS_URI environment variable is not set');
}

const connection = new IORedis(redisUri);

// Reuse the ioredis instance
export const myQueue = new Queue('myqueue', { connection });
export const myWorker = new Worker('myqueue', async (job) => {}, { connection });

