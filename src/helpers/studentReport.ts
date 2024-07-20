import mongoose from 'mongoose';
import Planner from '../models/plannerModel';
import User from '../models/userModel';
import IUser from '../types/IUser';
import moment from 'moment-timezone';
import { IPlanner } from '../types/IPlanner';
import SolvedQuestions from '../models/solvedQuestions';
import { StudentReport } from '../models/reportModel';

export const calculateStudentReport = async (userId: string) => {
    try {
        const user = await User.findById(userId) as IUser;
        if (!user) {
            throw new Error('User not found');
        }

        const timezone = 'Asia/Kolkata';
        const today = moment.tz(timezone).startOf('day');
        const todayStr = today.format('YYYY-MM-DD');
        const todayDayStr = today.format('dddd');

        const startDate = moment().startOf("isoWeek").toDate();
        const endDate = moment(startDate).endOf("isoWeek").toDate();

        const planner = await Planner.findOne({
            student: userId,
            startDate: { $gte: startDate },
            endDate: { $lte: endDate },
        }) as IPlanner;

        if (!planner) {
            throw new Error('Planner not found');
        }

        const todayPlannerDay = planner.days.find(day =>
            moment(day.date).tz(timezone).format('YYYY-MM-DD') === todayStr
        );
        if (!todayPlannerDay) {
            throw new Error('No planner data found for today');
        }

        const totalContinuousTopics = todayPlannerDay.continuousRevisionTopics.length;
        const totalBackTopics = todayPlannerDay.backRevisionTopics.length;
        const totalTopics = totalContinuousTopics + totalBackTopics;
        const completedTopicsCount = todayPlannerDay.completedTopics.length;
        const completionPercentage = (totalTopics > 0) ? (completedTopicsCount / totalTopics) * 100 : 0;

        // Calculate quiz completion percentage
        const totalQuestions = todayPlannerDay.questions ? Object.keys(todayPlannerDay.questions).length : 0;
        const solvedQuestionsToday = await SolvedQuestions.countDocuments({
            user: userId,
            date: today.toDate(),
        });
        const quizCompletionPercentage = (totalQuestions > 0) ? (solvedQuestionsToday / totalQuestions) * 100 : 0;

        // Check if a report document exists for the user with the same day and date
        let report = await StudentReport.findOne({
            user: userId,
            day: todayDayStr,
            date: today.toDate()
        });

        if (!report) {
            // Create a new report document
            report = new StudentReport({
                user: userId,
                day: todayDayStr,
                date: today.toDate(),
                session: completionPercentage,
                quiz: quizCompletionPercentage,
                overall: (completionPercentage + quizCompletionPercentage) / 2,
            });
        } else {
            // Update the existing report document
            report.session = completionPercentage;
            report.quiz = quizCompletionPercentage;
            report.overall = (completionPercentage + quizCompletionPercentage) / 2;
            report.updatedAt = new Date();
        }

        await report.save();

        // Ensure user.details and user.details.report exist
        if (!user.details) {
            user.details = {};
        }
        if (!user.details.report) {
            user.details.report = {};
        }

        user.details.report.dailyReport = {
            session: completionPercentage,
            quiz: quizCompletionPercentage,
            overall: (completionPercentage + quizCompletionPercentage) / 2,
        };

        await user.save();

    } catch (error) {
        console.log(error);
    }
};
