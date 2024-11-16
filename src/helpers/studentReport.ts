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

        const totalContinuousTopics = todayPlannerDay?.continuousRevisionTopics?.length;
        const totalContinuousSubTopics = todayPlannerDay?.continuousRevisionSubTopics?.length;
        const totalBackTopics = todayPlannerDay?.backRevisionTopics?.length;
        const totalTopics = totalContinuousTopics + totalBackTopics + totalContinuousSubTopics;
        const completedTopicsCount = todayPlannerDay?.completedTopics?.length;
        const completionPercentage = (totalTopics > 0) ? (completedTopicsCount / totalTopics) * 100 : 0;

        // Calculate quiz completion percentage
        let totalQuestions = 0;
        if (todayPlannerDay.questions) {
            totalQuestions = Object.values(todayPlannerDay.questions).reduce((acc, arr) => acc + arr.length, 0);
        }

        const solvedQuestionsToday = await SolvedQuestions.countDocuments({
            student: new mongoose.Types.ObjectId(userId),
            isCorrect: true,
            createdAt: {
                $gte: today.toDate(),
                $lt:  moment(today).endOf('day').toDate(),
            },
            tag: "daily_quiz"
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
                session: Math.round(completionPercentage),
                quiz: Math.round(quizCompletionPercentage),
                overall: Math.round((completionPercentage + quizCompletionPercentage) / 2),
            });
        } else {
            // Update the existing report document
            report.session =  Math.round(completionPercentage);
            report.quiz = Math.round(quizCompletionPercentage);
            report.overall = Math.round((completionPercentage + quizCompletionPercentage) / 2);
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

        if (!user.details.report.dailyReport) {
        user.details.report.dailyReport = {
            date: new Date(Date.now()),
            session: 0,
            quiz: 0
        };
        }

        // Check if the 'date' field exists in dailyReport
        if (!user.details.report.dailyReport.date) {
            user.details.report.dailyReport.date = today.toDate();
        }

        user.details.report.dailyReport = {
            date: today.toDate(),
            session: Math.round(completionPercentage),
            quiz: Math.round(quizCompletionPercentage),
            overall: Math.round((completionPercentage + quizCompletionPercentage) / 2),
        };

        user.updatedAt = new Date()
        await user.save();

    } catch (error) {
        console.log(error);
    }
};
