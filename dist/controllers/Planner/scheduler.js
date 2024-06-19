"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const _1 = require(".");
const maxRetries = 3;
const retryDelay = 1000; // 1 second delay between retries
const runJobWithRetries = async (retries) => {
    try {
        const users = await userModel_1.default.find({
            'subscription.status': 'active',
            'subscription.dateOfActivation': { $exists: true }
        });
        for (const user of users) {
            if (user.subscription && user.subscription.dateOfActivation) {
                await (0, _1.createPlanner)({ user }, {}, {});
            }
        }
        console.log('Scheduled createPlanner job completed successfully.');
    }
    catch (error) {
        if (retries > 0) {
            console.warn(`Error running scheduled createPlanner, retrying... (${retries} retries left)`, error);
            setTimeout(() => runJobWithRetries(retries - 1), retryDelay);
        }
        else {
            console.error('Error running scheduled createPlanner after multiple retries:', error);
        }
    }
};
// Schedule the task to run every Sunday at 11:59 PM
node_cron_1.default.schedule('59 23 * * 0', () => {
    runJobWithRetries(maxRetries);
});
