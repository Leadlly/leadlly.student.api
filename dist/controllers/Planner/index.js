"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanner = exports.createPlanner = void 0;
const error_1 = require("../../middlewares/error");
const plannerModel_1 = __importDefault(require("../../models/plannerModel"));
const generatePlanner_1 = require("./Generate/generatePlanner");
const getBackTopics_1 = require("./BackTopics/getBackTopics");
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
const getPlanner = async (req, res, next) => {
    try {
        const { date } = req.query;
        const today = new Date().toISOString().split("T")[0];
        const query = { user: req.user, date: today };
        if (date)
            query.date = date.toString();
        const data = await plannerModel_1.default.find(query);
        res.status(200).json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getPlanner = getPlanner;
