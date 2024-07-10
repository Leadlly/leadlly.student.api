import { app } from "./app";
import ConnectToDB from "./db/db";
import { questions_db } from "./db/db";
import { otpWorker, subWorker, trackerWorker } from "./services/bullmq/worker";
import "./controllers/Planner/scheduler";
import { logger } from "./utils/winstonLogger";
import serverless from "serverless-http";
import { watchTrackerChanges } from "./events/Tracker";

const port = process.env.PORT || 4000;

// Database
ConnectToDB(); 

// Workers
otpWorker; 
subWorker;
trackerWorker;

// Triggers
watchTrackerChanges()

const handler = serverless(app);

app.listen(port, () => logger.info(`Server is running on port ${port}`));

export { handler };
