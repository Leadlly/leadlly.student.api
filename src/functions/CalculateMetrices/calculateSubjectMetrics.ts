import { StudyData } from '../../models/studentData';
import IUser from '../../types/IUser';
import { questions_db } from '../../db/db';
import User from '../../models/userModel';
import Tracker from '../../models/trackerModel';
import SolvedQuestions from '../../models/solvedQuestions';
import mongoose from 'mongoose';

export const calculateSubjectMetrics = async (subjectName: string, userId: mongoose.Types.ObjectId) => {
    try {
        const chapters = await questions_db.collection("chapters").aggregate([
            { $match: { subjectName: subjectName } }
        ]).toArray();

        if (chapters.length === 0) {
            console.log('No chapters found for the subject');
            return;
        }

        let totalEfficiency = 0;
        let chapterCount = chapters.length;
        let totalProgress = 0;
      

        for (let chapter of chapters) {
            // Calculate efficiency
            const studyData = await StudyData.findOne({
                user: userId,
                'chapter.name': chapter.name,
                'subject.name': subjectName,
            });

            if (studyData) {
                totalEfficiency += studyData.chapter.overall_efficiency!;
            }

            // Calculate progress
            const tracker = await Tracker.findOne({
                user: userId,
                "subject.name": subjectName,
                'chapter.name': chapter.name
            });

            if (tracker && tracker.chapter && tracker.chapter.overall_progress) {
                totalProgress += tracker.chapter.overall_progress;
            }
        }

        // Calculate subject efficiency
        const subjectEfficiency = chapterCount > 0 ? totalEfficiency / chapterCount : 0;

        // Calculate overall progress
        const overallProgress = totalProgress / chapterCount;

        // Fetch solved questions and retrieve their full details
        const solvedQuestions = await SolvedQuestions.find({
            student: new mongoose.Types.ObjectId(userId)
        });

        let solvedQuestionCount = 0;
        for (const solvedQuestion of solvedQuestions) {
            const questionData = await questions_db.collection("questionbanks").findOne({
                _id: solvedQuestion.question,
                subject: subjectName
            });

            if (questionData) {
                solvedQuestionCount++;
            }
        }

        const totalQuestionInBankCount = await questions_db.collection("questionbanks").countDocuments({
            subject: subjectName
        });

        const totalQuestionsPercentage = totalQuestionInBankCount > 0
            ? Math.round((solvedQuestionCount / totalQuestionInBankCount) * 100)
            : 0;

        const userDoc = await User.findById(userId) as IUser;

        if (userDoc) {
            const subject = userDoc.academic.subjects.find(sub => sub.name === subjectName);

            if (subject) {
                subject.overall_efficiency = Math.round(subjectEfficiency * 100) / 100;
                subject.overall_progress = overallProgress;
                subject.total_questions_solved.number = solvedQuestionCount;
                subject.total_questions_solved.percentage = totalQuestionsPercentage;
            } else {
                userDoc.academic.subjects.push({
                    name: subjectName,
                    overall_efficiency: Math.round(subjectEfficiency * 100) / 100,
                    overall_progress: overallProgress,
                    total_questions_solved: {
                        number: solvedQuestionCount,
                        percentage: totalQuestionsPercentage,
                    },
                });
            }

            // Save the updated user document
            await userDoc.save();

            console.log(`Subject ${subjectName} efficiency calculated and updated: ${subjectEfficiency}`);
            console.log(`Overall progress for subject ${subjectName}: ${overallProgress}`);
        } else {
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('Error calculating subject metrics and progress:', error);
        throw new Error('Failed to calculate subject metrics and progress');
    }
};
