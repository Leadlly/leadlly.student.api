import Redis from "ioredis";
import { config } from "dotenv";
import { Worker } from "bullmq";
import { sendMail } from "../../utils/sendMail";
import createStudentTracker from "../../functions/Tracker/CreateTracker";
import { sendNotification } from "../../functions/MeetingNotification";
import updateStudentTracker from "../../functions/Tracker/UpdateTracker";

config();

const redisUri = process.env.REDIS_URI as string;

const otpConnection = new Redis(redisUri, { maxRetriesPerRequest: null });
const subConnection = new Redis(redisUri, { maxRetriesPerRequest: null });
const trackerConnection = new Redis(redisUri, { maxRetriesPerRequest: null });
const updateTrackerConnection = new Redis(redisUri, { maxRetriesPerRequest: null });
const meetingConnection = new Redis(redisUri, { maxRetriesPerRequest: null });

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

export const trackerWorker = new Worker(
  "tracker-queue",
  async (job) => {
    await createStudentTracker(job.data);
  },
  { connection: trackerConnection },
);

export const updateTrackerWorker = new Worker(
  "update-tracker-queue",
  async (job) => {
    await updateStudentTracker(job.data);
  },
  { connection: updateTrackerConnection },
);

export const generalWorker = new Worker(
  "meeting-queue",
  async (job) => {
    await sendNotification(job.data);
  },
  { connection: meetingConnection },
);
