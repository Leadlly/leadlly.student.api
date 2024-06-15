"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
let redis = null;
const connectToRedis = () => {
    const redisUri = process.env.REDIS_URI;
    // if (!redisUri) {
    //   console.log("Redis Url is undefined");
    //   return;
    // }
    redis = new ioredis_1.default(redisUri);
    redis.on("connect", () => console.log("Redis Connected."));
    redis.on("error", (err) => {
        console.log("Redis Client Error", err);
        redis.disconnect(); // Disconnect from Redis
    });
};
exports.connectToRedis = connectToRedis;
exports.default = redis;
