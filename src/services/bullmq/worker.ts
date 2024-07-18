import Redis from "ioredis";
import { config } from "dotenv";
import { Worker, WorkerOptions } from "bullmq";
import { sendMail } from "../../utils/sendMail";
import createStudentTracker from "../../functions/Tracker/CreateTracker";
import { sendNotification } from "../../functions/MeetingNotification";
import updateStudentTracker from "../../functions/Tracker/UpdateTracker";
import { logger } from "../../utils/winstonLogger";

config();

const redisUri = process.env.REDIS_URI as string;
const sharedConnection = new Redis(redisUri, { maxRetriesPerRequest: null });

const workerOptions: WorkerOptions = {
  connection: sharedConnection,
  concurrency: 1,
  limiter: {
    max: 10,
    duration: 1000,
  },
  lockDuration: 60000,
  removeOnComplete: {
    age: 30000
  },
  removeOnFail: {
    age: 20 * 24 * 60 * 60
  },
};

export const otpWorker = new Worker(
  "otp-queue",
  async (job) => {
    try {
      await sendMail(job.data?.options);
      logger.info(`Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Job ${job.id} failed: ${(error as Error).message}`);
      throw error; 
    }
  },
  workerOptions
);

export const subWorker = new Worker(
  "subscription-queue",
  async (job) => {
    try {
      await sendMail(job.data?.options);
      logger.info(`Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Job ${job.id} failed: ${(error as Error).message}`);
      throw error; 
    }
  },
  workerOptions
);

export const trackerWorker = new Worker(
  "tracker-queue",
  async (job) => {
    try {
      await createStudentTracker(job.data);
      logger.info(`Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Job ${job.id} failed: ${(error as Error).message}`);
      throw error; 
    }
  },
  workerOptions
);

export const updateTrackerWorker = new Worker(
  "update-tracker-queue",
  async (job) => {
    try {
      await updateStudentTracker(job.data);
      logger.info(`Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Job ${job.id} failed: ${(error as Error).message}`);
      throw error;
    }
  },
  workerOptions
);

export const meetingWorker = new Worker(
  "meeting-queue",
  async (job) => {
    try {
      await sendNotification(job.data);
      logger.info(`Job ${job.id} completed successfully`);
    } catch (error) {
      logger.error(`Job ${job.id} failed: ${(error as Error).message}`);
      throw error; 
    }
  },
  workerOptions
);