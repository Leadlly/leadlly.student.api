import { app } from "./app";
import ConnectToDB from "./db/db";
import { meetingWorker, otpWorker, subWorker, trackerWorker, updateTrackerWorker } from "./services/bullmq/worker";
import { logger } from "./utils/winstonLogger";
import serverless from "serverless-http";
import { watchTrackerChanges } from "./events/Tracker";
import "./controllers/Planner/scheduler";
import { watchMeetingChanges } from "./events/Meeting";

const port = process.env.PORT || 4000;

// Database
ConnectToDB(); 

// Workers
otpWorker; 
subWorker;
trackerWorker;
updateTrackerWorker;
meetingWorker;

// Triggers
watchTrackerChanges()
watchMeetingChanges()

const handler = serverless(app);

app.listen(port, () => logger.info(`Server is running on port ${port}`));

export { handler };
