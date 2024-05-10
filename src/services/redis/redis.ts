import Redis from "ioredis";

let redis: any = null;
export const connectToRedis = () => {
  const redisUri = process.env.REDIS_URI;

  if (!redisUri) {
    console.log("Redis Url is undefined");
    return;
  }

  redis = new Redis(redisUri);
  redis.on("connect", () => console.log("Redis Connected."));
  redis.on("error", (err: any) => {
    console.log("Redis Client Error", err);
    redis!.disconnect(); // Disconnect from Redis
  });
};

export default redis;
