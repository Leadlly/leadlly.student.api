import { createPlanner } from ".";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import { Request, Response, NextFunction } from "express";

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

export const handler = async (event: any) => {
  try {
    // Fetch users with active subscriptions or free trials
    const users: IUser[] = await User.find({
      $or: [
        { "subscription.status": "active", "subscription.dateOfActivation": { $exists: true } },
        { "freeTrial.active": true }
      ]
    });

    for (const user of users) {
      const req = { user, body: { nextWeek: true } } as Request;
      const res = mockResponse();
      await createPlanner(req, res, mockNext);
    }
    console.log(`Scheduled Planner job completed successfully.`);
  } catch (error) {
    console.error("Error executing scheduled job:", error);
  }
};
