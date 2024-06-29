"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
// Retry function
const retry = async (fn, retries, delay) => {
    for (let i = 0; i < retries; i++) {
        try {
            await fn();
            return;
        }
        catch (error) {
            if (i === retries - 1) {
                throw error;
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};
// Function to call createPlanner API
const callCreatePlannerAPI = async () => {
    await axios_1.default.post(`${process.env.BACKEND_SERVER}/api/planner/create`);
    console.log('Create planner API executed');
};
const callUpdatePlannerAPI = async () => {
    await axios_1.default.post(`${process.env.BACKEND_SERVER}/api/planner/update`);
    console.log('Update planner API executed');
};
node_cron_1.default.schedule('0 0 * * 0', async () => {
    try {
        await retry(callCreatePlannerAPI, 3, 120000);
    }
    catch (error) {
        console.error('Error executing create planner API', error);
    }
});
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        await retry(callUpdatePlannerAPI, 3, 120000);
    }
    catch (error) {
        console.error('Error executing update planner API', error);
    }
});
// console.log('Schedulers are set up');
