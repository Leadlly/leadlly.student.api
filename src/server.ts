import { server } from "./app";
import ConnectToDB from "./db/db";
import { connectToRedis } from "./services/redis/redis";
import { questions_db } from "./db/db";
import { otpWorker, subWorker } from "./services/bullmq/worker";
// import razorpay from "./services/payment/Razorpay";

const port = process.env.PORT || 4000;

//Database
ConnectToDB(); //main db
questions_db.on("connected", () => {
  console.log("Question_DB connected");
}); //question db

// Services
connectToRedis();

// Queues
otpWorker; // for otps related emails
subWorker; // for subscription related emails



server.listen(port, () => console.log(`Server is listening at port ${port}`));
