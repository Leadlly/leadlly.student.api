import cron from "node-cron";
import User from "../../../models/userModel";
import IUser from "../../../types/IUser";
import { create_weekly_quiz } from "./functions/create_weekly_quiz";

const maxRetries = 3;
const retryDelay = 180000; // 3-minute delay between retries
const batchSize = 30; // Number of users to process in each batch

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Function to process a batch of users
const processBatch = async (users: IUser[], jobFunction: Function) => {
  for (const user of users) {
    await jobFunction(user);
  }
};

// Function to run job with retries and batch processing
const runJobWithRetries = async (jobFunction: Function, retries: number, nextWeek: boolean) => {
  try {
    const users: IUser[] = await User.find({
      $or: [
        { "subscription.status": "active", "subscription.dateOfActivation": { $exists: true } },
        { "freeTrial.active": true }
      ]
    });

    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const userBatch = users.slice(i, i + batchSize);
      await processBatch(userBatch, jobFunction);
    }

    console.log(`Scheduled ${jobFunction.name} job completed successfully.`);
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Error running scheduled ${jobFunction.name}, retrying... (${retries} retries left)`,
        error,
      );
      await delay(retryDelay);
      await runJobWithRetries(jobFunction, retries - 1, nextWeek);
    } else {
      console.error(
        `Error running scheduled ${jobFunction.name} after multiple retries:`,
        error,
      );
    }
  }
};

// Schedule the createWeeklyQuiz task to run every Saturday at 12:40 AM IST 
cron.schedule("41 2 * * 0", () => {
  runJobWithRetries(create_weekly_quiz, maxRetries, true);
});

// Schedule the createWeeklyQuiz task to run every Saturday at 11:00 PM IST 
// cron.schedule("0 23 * * 6", () => {
//   runJobWithRetries(create_weekly_quiz, maxRetries, true);
// });
