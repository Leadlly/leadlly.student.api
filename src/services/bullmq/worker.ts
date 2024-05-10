import { Worker } from "bullmq";
import redis from "../redis/redis";
import { sendMail } from "../../utils/sendMail";
import Redis from "ioredis";

const connection = new Redis({ maxRetriesPerRequest: null });

export const otpWorker = new Worker(
  "otp-queue",
  async (job) => {
    await sendMail(job.data?.options);
  },
  { connection },
);

export const subWorker = new Worker(
  "subscription-queue",
  async (job) => {
    await sendMail(job.data?.options);
  },
  { connection },
);
