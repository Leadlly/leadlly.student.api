"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const _1 = require(".");
const maxRetries = 3;
const retryDelay = 180000; // 3-minute delay between retries
const mockResponse = () => {
    const res = {};
    res.status = (code) => {
        console.log(`Status: ${code}`);
        return res;
    };
    res.json = (data) => {
        console.log('JSON Response:', data);
        return res;
    };
    return res;
};
const mockNext = (error) => {
    if (error) {
        console.error('Error:', error);
    }
};
const runJobWithRetries = async (jobFunction, retries) => {
    try {
        const users = await userModel_1.default.find({
            'subscription.status': 'active',
            'subscription.dateOfActivation': { $exists: true }
        });
        for (const user of users) {
            if (user.subscription && user.subscription.dateOfActivation) {
                const req = { user };
                const res = mockResponse();
                await jobFunction(req, res, mockNext);
            }
        }
        console.log(`Scheduled ${jobFunction.name} job completed successfully.`);
    }
    catch (error) {
        if (retries > 0) {
            console.warn(`Error running scheduled ${jobFunction.name}, retrying... (${retries} retries left)`, error);
            setTimeout(() => runJobWithRetries(jobFunction, retries - 1), retryDelay);
        }
        else {
            console.error(`Error running scheduled ${jobFunction.name} after multiple retries:`, error);
        }
    }
};
// Schedule the createPlanner task to run every Monday at 12:15 AM
node_cron_1.default.schedule('24 2 * * 1', () => {
    runJobWithRetries(_1.createPlanner, maxRetries);
});
// Schedule the updateDailyPlanner task to run every day at 12:30 AM
node_cron_1.default.schedule('25 2 * * *', () => {
    runJobWithRetries(_1.updateDailyPlanner, maxRetries);
});
