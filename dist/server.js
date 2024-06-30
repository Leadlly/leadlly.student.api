"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const app_1 = require("./app");
const db_1 = __importDefault(require("./db/db"));
const db_2 = require("./db/db");
const worker_1 = require("./services/bullmq/worker");
require("./controllers/Planner/scheduler");
const winstonLogger_1 = require("./utils/winstonLogger");
const serverless_http_1 = __importDefault(require("serverless-http"));
// import razorpay from "./services/payment/Razorpay";
const port = process.env.PORT || 4000;
//Database
(0, db_1.default)(); //main db
db_2.questions_db.on("connected", () => {
    console.log("Question_DB connected");
});
// Redis
// export const redis = new Redis()
// redis.on("connect", () => console.log("Redis Connected."));
// redis.on("error", (err: any) => {
//   console.log("Redis Client Error", err);
//   redis!.disconnect(); // Disconnect from Redis
// });
// Queues
worker_1.otpWorker; // for otps related emails
worker_1.subWorker; // for subscription related emails
// Wrapping express app with serverless-http
exports.handler = (0, serverless_http_1.default)(app_1.app);
app_1.app.listen(port, () => winstonLogger_1.logger.info(`Server is running on port ${port}`));
