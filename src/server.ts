import { app } from "./app";
import ConnectToDB from "./db/db";
import { otpWorker, subWorker, trackerWorker } from "./services/bullmq/worker";
import { logger } from "./utils/winstonLogger";
import serverless from "serverless-http";
import { watchTrackerChanges } from "./events/Tracker";
import { watchMeetingChanges } from "./events/Meeting";
import "./controllers/Planner/scheduler";

const port = process.env.PORT || 4000;

// Database
ConnectToDB(); 

// Workers
otpWorker; 
subWorker;
trackerWorker;

// Triggers
watchTrackerChanges()
watchMeetingChanges()

const handler = serverless(app);

app.listen(port, () => logger.info(`Server is running on port ${port}`));

export { handler };
