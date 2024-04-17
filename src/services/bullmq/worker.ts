import { Worker } from "bullmq";
import redis from "../redis";
import { sendMail } from "../../utils/sendMail";
import Redis from "ioredis";

const connection = new Redis({ maxRetriesPerRequest: null });

export const myWorker = new Worker(
  "email-queue",
  async (job) => {
    await sendMail(job.data?.options);
  },
  { connection },
);
