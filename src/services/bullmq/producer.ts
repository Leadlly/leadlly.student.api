import { Queue } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import { config } from "dotenv";
config();

const redisUri = process.env.REDIS_URI as string;

const redisConnection = new Redis(redisUri);
// Reuse the ioredis instance
export const otpQueue = new Queue("otp-queue", { connection: redisConnection });
export const subQueue = new Queue("subscription-queue", { connection: redisConnection });
export const trackerQueue = new Queue("tracker-queue", { connection: redisConnection });
export const updateTrackerQueue = new Queue("update-tracker-queue", { connection: redisConnection });
export const meetingQueue = new Queue("meeting-queue", { connection: redisConnection });
export const saveQuizQuestionsQueue = new Queue("quiz-queue", { connection: redisConnection });
