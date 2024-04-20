import { app } from "./app";
import ConnectToDB from "./db/db";
import { connectToRedis } from "./services/redis";
import { questions_db } from "./db/db";
import { otpWorker, subWorker } from "./services/bullmq/worker";

const port = process.env.PORT || 4000;

//Database
ConnectToDB();
questions_db.on("connected", () => {
  console.log("Question_DB connected");
});

//Services
connectToRedis();

// queues
otpWorker; // for otps related emails
subWorker; // for subscription related emails

app.listen(port, () => console.log(`Server is listening at port ${port}`));
