import cron from "node-cron";
import IUser from "../../types/IUser";
import User from "../../models/userModel";
import { createPlanner } from ".";
import { Request, Response, NextFunction } from "express";

const maxRetries = 3;
const retryDelay = 180000; // 3-minute delay between retries
const batchSize = 30; // Number of users to process in each batch

const mockResponse = () => {
  const res = {} as Response;
  res.status = (code: number) => {
    console.log(`Status: ${code}`);
    return res;
  };
  res.json = (data: any) => {
    console.log("JSON Response:", data);
    return res;
  };
  return res;
};

const mockNext: NextFunction = (error?: any) => {
  if (error) {
    console.error("Error:", error);
  }
};

// Function to process a batch of users
const processBatch = async (users: IUser[], jobFunction: Function) => {
  for (const user of users) {
    const req = { user, body: { nextWeek: true } } as Request;
    const res = mockResponse();
    await jobFunction(req, res, mockNext);
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
      setTimeout(() => runJobWithRetries(jobFunction, retries - 1, nextWeek), retryDelay);
    } else {
      console.error(
        `Error running scheduled ${jobFunction.name} after multiple retries:`,
        error,
      );
    }
  }
};

// Schedule the createPlanner task to run every Sunday at 12:40 AM IST
cron.schedule("40 0 * * 0", () => {
  runJobWithRetries(createPlanner, maxRetries, true);
});

// Schedule the createPlanner task to run every Sunday at 11:00 PM IST
cron.schedule("0 23 * * 0", () => {
  runJobWithRetries(createPlanner, maxRetries, true);
});