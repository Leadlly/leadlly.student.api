"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subWorker = exports.otpWorker = void 0;
const bullmq_1 = require("bullmq");
const sendMail_1 = require("../../utils/sendMail");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const redisUri = process.env.REDIS_URI;
// if (!redisUri) {
//  throw new Error("Redis Url is undefined");;
// }
const connection = new ioredis_1.default(redisUri, { maxRetriesPerRequest: null });
exports.otpWorker = new bullmq_1.Worker("otp-queue", async (job) => {
    await (0, sendMail_1.sendMail)(job.data?.options);
}, { connection });
exports.subWorker = new bullmq_1.Worker("subscription-queue", async (job) => {
    await (0, sendMail_1.sendMail)(job.data?.options);
}, { connection });
