import { Queue } from "bullmq";
import redis from "../redis/redis";

// Reuse the ioredis instance
export const otpQueue = new Queue("otp-queue", { connection: redis });
export const subQeuue = new Queue("subscription-queue", {connection: redis})
