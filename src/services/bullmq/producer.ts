import { Queue } from "bullmq";
import { Redis } from "ioredis";


const connection = new Redis();
// Reuse the ioredis instance
export const otpQueue = new Queue("otp-queue", { connection: connection });
export const subQeuue = new Queue("subscription-queue", {connection: connection})
