import { Queue, Worker } from "bullmq";
import redis from "../redis";

// Reuse the ioredis instance
export const myQueue = new Queue("email-queue", { connection: redis });
