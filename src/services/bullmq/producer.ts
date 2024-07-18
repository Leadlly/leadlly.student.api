import { Queue } from "bullmq";
import { Redis, RedisOptions } from "ioredis";
import { config } from "dotenv";
config();

const redisUri = process.env.REDIS_URI as string;

const otpConnection = new Redis(redisUri);
const subConnection = new Redis(redisUri);
const trackerConnection = new Redis(redisUri);
const updateTrackerConnection = new Redis(redisUri);
const meetingConnection = new Redis(redisUri);
// Reuse the ioredis instance
export const otpQueue = new Queue("otp-queue", { connection: otpConnection });
export const subQueue = new Queue("subscription-queue", { connection: subConnection });
export const trackerQueue = new Queue("tracker-queue", { connection: trackerConnection });
export const updateTrackerQueue = new Queue("update-tracker-queue", { connection: updateTrackerConnection });
export const meetingQueue = new Queue("meeting-queue", { connection: meetingConnection });
