"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyPlanner = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const plannerModel_1 = __importDefault(require("../../../models/plannerModel"));
const db_1 = require("../../../db/db");
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timezone = 'Asia/Kolkata';
const generateWeeklyPlanner = async (studentId) => {
    const startDate = (0, moment_timezone_1.default)().tz(timezone).startOf('isoWeek').toDate();
    const endDate = (0, moment_timezone_1.default)().tz(timezone).endOf('isoWeek').toDate();
    const yesterday = (0, moment_timezone_1.default)().tz(timezone).subtract(1, 'day').startOf('day').toDate();
    // Fetch continuous revision and back revision topics
    const continuousRevisionTopics = await db_1.db.collection('topics').find({ student: studentId, tag: 'continuous_revision', createdAt: { $gte: yesterday, $lt: startDate } }).toArray();
    const backRevisionTopics = await db_1.db.collection('topics').find({ student: studentId, tag: 'back_revision' }).toArray();
    // Generate daily topics
    const days = daysOfWeek.map((day, index) => {
        const date = (0, moment_timezone_1.default)(startDate).add(index, 'days').tz(timezone).toDate();
        // Get topics for the day
        const dailyTopics = getDailyTopics(continuousRevisionTopics, backRevisionTopics);
        // Reseting the tag for continuousRevisionTopics tag
        // continuousRevisionTopics.tag = ""
        return { day, date, topics: dailyTopics };
    });
    const planner = new plannerModel_1.default({
        student: studentId,
        startDate,
        endDate,
        days
    });
    return planner;
};
exports.generateWeeklyPlanner = generateWeeklyPlanner;
