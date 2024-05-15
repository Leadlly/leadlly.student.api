import { server } from "./app";
import ConnectToDB from "./db/db";
import { connectToRedis } from "./services/redis/redis";
import { questions_db } from "./db/db";
import { otpWorker, subWorker } from "./services/bullmq/worker";
import { Redis } from "ioredis";
// import razorpay from "./services/payment/Razorpay";

const port = process.env.PORT || 4000;

//Database
ConnectToDB(); //main db
questions_db.on("connected", () => {
  console.log("Question_DB connected");
}); //question db


// Redis
export const redis = new Redis()
redis.on("connect", () => console.log("Redis Connected."));
redis.on("error", (err: any) => {
  console.log("Redis Client Error", err);
  redis!.disconnect(); // Disconnect from Redis
});

// Queues
otpWorker; // for otps related emails
subWorker; // for subscription related emails



server.listen(port, () => console.log(`Server is listening at port ${port}`));
