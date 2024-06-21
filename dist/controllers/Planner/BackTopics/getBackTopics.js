"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBackRevistionTopics = void 0;
const moment_1 = __importDefault(require("moment"));
const studentData_1 = require("../../../models/studentData");
const getWeekNumber = (startDate, currentDate) => {
    const start = (0, moment_1.default)(startDate);
    const current = (0, moment_1.default)(currentDate);
    return current.diff(start, 'weeks') + 1;
};
const getBackRevistionTopics = async (studentId, dateOfSubscription) => {
    const activeContinuousRevisionTopics = await studentData_1.StudyData.find({
        user: studentId,
        tag: 'active_continuous_revision',
    }).exec();
    const unrevisedTopics = await studentData_1.StudyData.find({
        user: studentId,
        tag: 'unrevised_topic',
    }).exec();
    const continuousLowEfficiency = activeContinuousRevisionTopics.filter(data => data.topic.overall_efficiency < 40);
    const unrevisedLowEfficiency = unrevisedTopics.filter(data => data.topic.overall_efficiency < 40);
    const continuousModerateEfficiency = activeContinuousRevisionTopics.filter(data => data.topic.overall_efficiency >= 40 && data.topic.overall_efficiency < 60);
    const currentWeek = getWeekNumber(dateOfSubscription, new Date());
    let backRevisionTopics = [];
    if (currentWeek === 1 || currentWeek === 2) {
        // Week 1 and Week 2: backRevisionTopics contains only unrevised topics
        backRevisionTopics = unrevisedTopics;
    }
    else {
        // For Week 3 onwards:
        // Determine the reference week to fetch topics from
        const referenceWeek = currentWeek - 2; // Fetch topics from the previous week
        // Filter topics based on the reference week
        const filteredContinuousLowEfficiency = continuousLowEfficiency.filter(data => getWeekNumber(data.updatedAt, new Date()) === referenceWeek);
        const filteredUnrevisedLowEfficiency = unrevisedLowEfficiency.filter(data => getWeekNumber(data.updatedAt, new Date()) === referenceWeek);
        const filteredUnrevisedTopics = unrevisedTopics.filter(data => getWeekNumber(data.updatedAt, new Date()) === referenceWeek);
        // Construct the backRevisionTopics array in the specified order
        backRevisionTopics = [
            ...filteredContinuousLowEfficiency,
            ...filteredUnrevisedLowEfficiency,
            ...filteredUnrevisedTopics,
            ...continuousModerateEfficiency
        ];
    }
    return backRevisionTopics;
};
exports.getBackRevistionTopics = getBackRevistionTopics;
