import Redis from "ioredis";
import { config } from "dotenv";
import { Worker, WorkerOptions } from "bullmq";
import { sendMail } from "../../utils/sendMail";
import createStudentTracker from "../../functions/Tracker/CreateTracker";
import { sendNotification } from "../../functions/MeetingNotification";
import updateStudentTracker from "../../functions/Tracker/UpdateTracker";
import { logger } from "../../utils/winstonLogger";
import { saveQuizQuestions } from "../../controllers/Quiz/helpers/saveQuizQuestion";

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
    age: 30000,
  },
  removeOnFail: {
    age: 20 * 24 * 60 * 60,
  },
};

// OTP Worker
export const otpWorker = new Worker(
  "otp-queue",
  async (job) => {
    await sendMail(job.data?.options);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

otpWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`OTP Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`OTP Job failed with error: ${err.message}`);
  }
});

otpWorker.on('completed', (job) => {
  if (job) {
    logger.info(`OTP Job ${job.id} completed successfully`);
  }
});

// Subscription Worker
export const subWorker = new Worker(
  "subscription-queue",
  async (job) => {
    await sendMail(job.data?.options);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

subWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Subscription Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`Subscription Job failed with error: ${err.message}`);
  }
});

subWorker.on('completed', (job) => {
  if (job) {
    logger.info(`Subscription Job ${job.id} completed successfully`);
  }
});

// Tracker Worker
export const trackerWorker = new Worker(
  "tracker-queue",
  async (job) => {
    await createStudentTracker(job.data);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

trackerWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Tracker Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`Tracker Job failed with error: ${err.message}`);
  }
});

trackerWorker.on('completed', (job) => {
  if (job) {
    logger.info(`Tracker Job ${job.id} completed successfully`);
  }
});

// Update Tracker Worker
export const updateTrackerWorker = new Worker(
  "update-tracker-queue",
  async (job) => {
    await updateStudentTracker(job.data?.topic, job.data?.user);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

updateTrackerWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Update Tracker Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`Update Tracker Job failed with error: ${err.message}`);
  }
});

updateTrackerWorker.on('completed', (job) => {
  if (job) {
    logger.info(`Update Tracker Job ${job.id} completed successfully`);
  }
});

// Meeting Worker
export const meetingWorker = new Worker(
  "meeting-queue",
  async (job) => {
    await sendNotification(job.data);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

meetingWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Meeting Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`Meeting Job failed with error: ${err.message}`);
  }
});

meetingWorker.on('completed', (job) => {
  if (job) {
    logger.info(`Meeting Job ${job.id} completed successfully`);
  }
});

// Quiz Question Worker
export const quizQuestionWorker = new Worker(
  "quiz-queue",
  async (job) => {
    await saveQuizQuestions(job.data);
    logger.info(`Job ${job.id} completed successfully`);
  },
  workerOptions
);

quizQuestionWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Quiz Question Job ${job.id} failed with error: ${err.message}`);
  } else {
    logger.error(`Quiz Question Job failed with error: ${err.message}`);
  }
});

quizQuestionWorker.on('completed', (job) => {
  if (job) {
    logger.info(`Quiz Question Job ${job.id} completed successfully`);
  }
});
