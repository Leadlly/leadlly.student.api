import cron from "node-cron";
import IUser from "../../types/IUser";
import User from "../../models/userModel";
import { createPlanner, updateDailyPlanner } from ".";
import { Request, Response, NextFunction } from "express";

const maxRetries = 3;
const retryDelay = 180000; // 3-minute delay between retries

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

const runJobWithRetries = async (jobFunction: Function, retries: number) => {
  try {
    const users: IUser[] = await User.find({
      $or: [
        { "subscription.status": "active", "subscription.dateOfActivation": { $exists: true } },
        { "freeTrial.active": true }
      ]
    });

    for (const user of users) {
        const req = { user } as Request;
        const res = mockResponse();
        await jobFunction(req, res, mockNext);
    }
    console.log(`Scheduled ${jobFunction.name} job completed successfully.`);
  } catch (error) {
    if (retries > 0) {
      console.warn(
        `Error running scheduled ${jobFunction.name}, retrying... (${retries} retries left)`,
        error,
      );
      setTimeout(() => runJobWithRetries(jobFunction, retries - 1), retryDelay);
    } else {
      console.error(
        `Error running scheduled ${jobFunction.name} after multiple retries:`,
        error,
      );
    }
  }
};

// Schedule the createPlanner task to run every Monday at 12:30 AM
cron.schedule("30 0 * * 1", () => {
  runJobWithRetries(createPlanner, maxRetries);
});

// Schedule the updateDailyPlanner task to run every day at 1:00 AM
cron.schedule("0 1 * * *", () => {
  runJobWithRetries(updateDailyPlanner, maxRetries);
});