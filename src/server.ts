import { app } from "./app";
import ConnectToDB from "./db/db";
import { questions_db } from "./db/db";
import { otpWorker, subWorker } from "./services/bullmq/worker";
import "./controllers/Planner/scheduler";
import { logger } from "./utils/winstonLogger";
import serverless from "serverless-http";
import { watchStudyDataCollection } from "./events/updateTracker";

// import razorpay from "./services/payment/Razorpay";

const port = process.env.PORT || 4000;

//Database
ConnectToDB(); //main db
// questions_db.on("connected", () => {
//   console.log("Question_DB connected");
// });


// Queues
otpWorker; 
subWorker; // for subscription related emails

watchStudyDataCollection()

const handler = serverless(app);

app.listen(port, () => logger.info(`Server is running on port ${port}`));

export { handler };
