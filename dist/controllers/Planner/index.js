"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanner = exports.updateDailyPlanner = exports.createPlanner = void 0;
const error_1 = require("../../middlewares/error");
const plannerModel_1 = __importDefault(require("../../models/plannerModel"));
const generatePlanner_1 = require("./Generate/generatePlanner");
const getBackTopics_1 = require("./BackTopics/getBackTopics");
const getDailyQuestions_1 = require("./DailyQuestions/getDailyQuestions");
const moment_1 = __importDefault(require("moment"));
const getDailyTopics_1 = require("./DailyTopics/getDailyTopics");
const studentData_1 = require("../../models/studentData");
const createPlanner = async (req, res, next) => {
    try {
        const user = req.user;
        const backRevisionTopics = await (0, getBackTopics_1.getBackRevistionTopics)(user._id, user.subscription.dateOfActivation);
        const generatedPlanner = await (0, generatePlanner_1.generateWeeklyPlanner)(user, backRevisionTopics);
        const planner = await plannerModel_1.default.create(generatedPlanner);
        res.status(200).json({
            success: true,
            message: "Done",
            planner,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.createPlanner = createPlanner;
const updateDailyPlanner = async (req, res, next) => {
    const today = (0, moment_1.default)().tz("Asia/Kolkata").startOf("day").toDate();
    const yesterday = (0, moment_1.default)().tz("Asia/Kolkata").subtract(1, 'days').startOf("day").toDate();
    const user = req.user;
    const continuousRevisionTopics = (await studentData_1.StudyData.find({
        user: user._id,
        tag: "continuous_revision",
        createdAt: { $gte: yesterday },
    }).exec());
    const planner = await plannerModel_1.default.findOne({
        student: user._id,
        "days.date": today
    });
    if (!planner) {
        throw new Error(`Planner not found for user ${user._id} and date ${today}`);
    }
    const { dailyContinuousTopics, dailyBackTopics } = (0, getDailyTopics_1.getDailyTopics)(continuousRevisionTopics, [], user);
    dailyContinuousTopics.forEach(data => {
        if (!data.topic.studiedAt) {
            data.topic.studiedAt = [];
        }
        data.topic.studiedAt.push({ date: today, efficiency: 0 });
    });
    const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];
    const dailyQuestions = await (0, getDailyQuestions_1.getDailyQuestions)((0, moment_1.default)(today).format('dddd'), today, dailyTopics);
    await plannerModel_1.default.updateOne({ student: user._id, "days.date": today }, {
        $set: {
            "days.$.continuousRevisionTopics": dailyContinuousTopics,
            "days.$.questions": dailyQuestions
        }
    });
    continuousRevisionTopics.forEach(data => data.tag = "active_continuous_revision");
    await Promise.all(continuousRevisionTopics.map(data => data.save()));
    res.status(200).json({
        success: true,
        message: `Updated planner for user ${user._id} for date ${today}`,
        planner,
    });
};
exports.updateDailyPlanner = updateDailyPlanner;
const getPlanner = async (req, res, next) => {
    try {
        const today = (0, moment_1.default)().tz("Asia/Kolkata");
        const startOfWeek = today.clone().startOf('isoWeek');
        const endOfWeek = today.clone().endOf('isoWeek');
        const userId = req.user._id;
        const planner = await plannerModel_1.default.findOne({
            student: userId,
            startDate: { $gte: startOfWeek.toDate() },
            endDate: { $lte: endOfWeek.toDate() },
        });
        if (!planner) {
            return res.status(404).json({
                success: false,
                message: 'Planner not found for the current week',
            });
        }
        res.status(200).json({
            success: true,
            data: planner,
        });
    }
    catch (error) {
        console.error(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getPlanner = getPlanner;
