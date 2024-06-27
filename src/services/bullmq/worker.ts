import { Worker } from "bullmq";
import { sendMail } from "../../utils/sendMail";
import Redis from "ioredis";
import { config } from "dotenv";
config();

const redisUri = process.env.REDIS_URI as string;

const otpConnection = new Redis(redisUri, { maxRetriesPerRequest: null });
const subConnection = new Redis(redisUri, { maxRetriesPerRequest: null });

export const otpWorker = new Worker(
  "otp-queue",
  async (job) => {
    await sendMail(job.data?.options);
  },
  { connection: otpConnection },
);

export const subWorker = new Worker(
  "subscription-queue",
  async (job) => {
    await sendMail(job.data?.options);
  },
  { connection: subConnection },
);
