import cron from 'node-cron';
import IUser from '../../types/IUser';
import User from '../../models/userModel';
import { createPlanner } from '.';
import { Request, Response, NextFunction } from 'express';

const maxRetries = 3;
const retryDelay = 1000; // 1 second delay between retries

const runJobWithRetries = async (retries: number) => {
  try {
    const users: IUser[] = await User.find({
      'subscription.status': 'active',
      'subscription.dateOfActivation': { $exists: true }
    });

    for (const user of users) {
      if (user.subscription && user.subscription.dateOfActivation) {
        await createPlanner({ user } as Request, {} as Response, {} as NextFunction);
      }
    }
    console.log('Scheduled createPlanner job completed successfully.');
  } catch (error) {
    if (retries > 0) {
      console.warn(`Error running scheduled createPlanner, retrying... (${retries} retries left)`, error);
      setTimeout(() => runJobWithRetries(retries - 1), retryDelay);
    } else {
      console.error('Error running scheduled createPlanner after multiple retries:', error);
    }
  }
};

// Schedule the task to run every Sunday at 11:59 PM
cron.schedule('59 23 * * 0', () => {
  runJobWithRetries(maxRetries);
});
