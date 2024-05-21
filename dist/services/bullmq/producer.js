"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subQeuue = exports.otpQueue = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
const connection = new ioredis_1.Redis();
// Reuse the ioredis instance
exports.otpQueue = new bullmq_1.Queue("otp-queue", { connection: connection });
exports.subQeuue = new bullmq_1.Queue("subscription-queue", { connection: connection });
