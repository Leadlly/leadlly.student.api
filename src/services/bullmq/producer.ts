import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { config } from "dotenv";
config();


const redisUri = process.env.REDIS_URI as string;

  // if (!redisUri) {
  //  throw new Error("Redis Url is undefined");;
  // }

const connection = new Redis(redisUri);
// Reuse the ioredis instance
export const otpQueue = new Queue("otp-queue", { connection: connection });
export const subQueue = new Queue("subscription-queue", {connection: connection})
