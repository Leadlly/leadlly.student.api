"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const app_1 = require("./app");
const db_1 = __importDefault(require("./db/db"));
const db_2 = require("./db/db");
const worker_1 = require("./services/bullmq/worker");
const ioredis_1 = require("ioredis");
// import razorpay from "./services/payment/Razorpay";
const port = process.env.PORT || 4000;
//Database
(0, db_1.default)(); //main db
db_2.questions_db.on("connected", () => {
    console.log("Question_DB connected");
}); //question db
// Redis
exports.redis = new ioredis_1.Redis();
exports.redis.on("connect", () => console.log("Redis Connected."));
exports.redis.on("error", (err) => {
    console.log("Redis Client Error", err);
    exports.redis.disconnect(); // Disconnect from Redis
});
// Queues
worker_1.otpWorker; // for otps related emails
worker_1.subWorker; // for subscription related emails
app_1.server.listen(port, () => console.log(`Server is listening at port ${port}`));
