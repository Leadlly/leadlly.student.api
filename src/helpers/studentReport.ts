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

        // Check if a report document exists for the user
        let report = await StudentReport.findOne({ user: userId });

        if (!report) {
            // Create a new report document
            report = new StudentReport({
                user: userId,
                dailyReport: {
                    session: completionPercentage,
                    quiz: quizCompletionPercentage,
                    overall: 0,
                },
                weeklyReport: [{
                    day: today.format('dddd'),
                    date: today.toDate(),
                    session: completionPercentage,
                    quiz: quizCompletionPercentage,
                    overall: 0,
                }],
                monthlyReport: [],
                overallReport: [],
            });
        } else {
            // Check if today's entry already exists in the weekly report
            const todayWeeklyEntryIndex = report.weeklyReport.findIndex(
                entry => moment(entry.date).tz(timezone).format('YYYY-MM-DD') === todayStr
            );

            if (todayWeeklyEntryIndex > -1) {
                // Update the existing entry
                report.weeklyReport[todayWeeklyEntryIndex].session = completionPercentage;
                report.weeklyReport[todayWeeklyEntryIndex].quiz = quizCompletionPercentage;
            } else {
                // Add a new entry
                report.weeklyReport.push({
                    day: today.format('dddd'),
                    date: today.toDate(),
                    session: completionPercentage,
                    quiz: quizCompletionPercentage,
                    overall: 0,
                });
            }

            report.dailyReport.session = completionPercentage;
            report.dailyReport.quiz = quizCompletionPercentage;
            report.updatedAt = new Date();
        }

        await report.save();

    } catch (error) {
        console.log(error);
    }
};
