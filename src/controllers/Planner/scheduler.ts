import cron from 'node-cron';
import axios from 'axios';

// Retry function
const retry = async (fn: () => Promise<void>, retries: number, delay: number): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

// Function to call createPlanner API
const callCreatePlannerAPI = async (): Promise<void> => {
  await axios.post(`${process.env.BACKEND_SERVER}/api/planner/create`);
  console.log('Create planner API executed');
};

const callUpdatePlannerAPI = async (): Promise<void> => {
  await axios.post(`${process.env.BACKEND_SERVER}/api/planner/update`);
  console.log('Update planner API executed');
};

cron.schedule('0 0 * * 0', async () => {
  try {
    await retry(callCreatePlannerAPI, 3, 120000); 
  } catch (error) {
    console.error('Error executing create planner API', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    await retry(callUpdatePlannerAPI, 3, 120000); 
  } catch (error) {
    console.error('Error executing update planner API', error);
  }
});

// console.log('Schedulers are set up');
