"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanner = exports.createPlanner = exports.postFeedbackData = void 0;
const error_1 = require("../../middlewares/error");
const db_1 = require("../../db/db");
const plannerModel_1 = __importDefault(require("../../models/plannerModel"));
const generatePlanner_1 = require("./Generate/generatePlanner");
const studentData_1 = require("../../models/studentData");
const actions_1 = require("./actions");
const postFeedbackData = async (req, res, next) => {
    try {
        const body = req.body;
        const { chapter, topic, level } = body;
        if (!chapter || !topic)
            return next(new error_1.CustomError("Chapter and Topic required", 400));
        const sanitisedData = {
            chapter,
            topic,
            level,
            user: req.user
        };
        await db_1.db.collection("feedback").insertOne(sanitisedData);
        res.status(200).json({
            success: true,
            message: "Done",
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.postFeedbackData = postFeedbackData;
const createPlanner = async (req, res, next) => {
    try {
        const user = req.user;
        const allStudentData = await studentData_1.StudyData.find({ user: user._id });
        const { standard, schedule } = user.about;
        if (standard && schedule && actions_1.scheduleActions[standard] && actions_1.scheduleActions[standard][schedule]) {
            const action = actions_1.scheduleActions[standard][schedule];
            await action(req, res, next); // Execute the appropriate action based on standard and schedule
        }
        else {
            throw new Error('Unsupported standard or schedule');
        }
        const generatedPlanner = await (0, generatePlanner_1.generateWeeklyPlanner)('666a01a69461d46dc3c7b5fb');
        const planner = await plannerModel_1.default.create(generatedPlanner);
        res.status(200).json({
            success: true,
            message: "Done",
            planner,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.createPlanner = createPlanner;
const getPlanner = async (req, res, next) => {
    try {
        const { date } = req.query;
        const today = new Date().toISOString().split('T')[0];
        const query = { user: req.user, date: today };
        if (date)
            query.date = date.toString();
        const data = await plannerModel_1.default.find(query);
        res.status(200).json({
            success: true,
            data
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getPlanner = getPlanner;
