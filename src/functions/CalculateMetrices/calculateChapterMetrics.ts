import { StudyData } from '../../models/studentData';
import { questions_db } from '../../db/db';
import mongoose from 'mongoose';
import SolvedQuestions from '../../models/solvedQuestions';
import IDataSchema from '../../types/IDataSchema';
import { calculateSubjectMetrics } from './calculateSubjectMetrics';
import { CustomError } from '../../middlewares/error';

interface Result {
    overall_efficiency: number;
    overall_progress?: number;
    total_questions_solved: {
        number?: number;
        percentage?: number;
    };
}

export const calculateChapterMetrics = async (chapterName: string, userId: mongoose.Types.ObjectId) => {
    try {
        // Fetch topics by chapter name
        const topics = await questions_db.collection("topics").aggregate([
            { $match: { chapterName: chapterName } }
        ]).toArray();

        // Fetch chapter data
        const chapterData = await questions_db.collection("chapters").findOne({ name: chapterName });
        if (!chapterData) throw new CustomError('No chapter data', 404);

        let totalEfficiency = 0;
        const topicCount = topics.length;
        const solvedTopicsSet = new Set();

        // Count total questions in the question bank for this chapter
        const totalQuestionsInBankCount = await questions_db.collection("questionbanks").countDocuments({
            "chapter": chapterName
        });

        // Fetch all solved questions for this student
        const solvedQuestions = await SolvedQuestions.find({
            student: userId
        }, 'question');  

        // Extract all unique questionIds from solvedQuestions
        const questionIds = solvedQuestions.map(q => q.question);

        // Fetch all questions in one query from `questions_db` based on questionIds
        const questions = await questions_db.collection("questionbanks").find({
            _id: { $in: questionIds.map(id => new mongoose.Types.ObjectId(id)) },
            chapter: chapterName
        }).toArray();

        let solvedQuestionCount = 0;

        // Loop through each topic and calculate efficiency
        for (let topic of topics) {
            const studyData = await StudyData.findOne({
                user: userId,
                'topic.name': topic.name,
                'chapter.name': chapterName,
            }) as IDataSchema;

            if (studyData) {
                totalEfficiency += studyData.topic.overall_efficiency || 0;
            }

            // Check if any fetched questions match the current topic
            for (let question of questions) {
                if (question.topics.includes(topic.name)) {
                    solvedQuestionCount += 1;
                    solvedTopicsSet.add(topic.name);
                }
            }
        }

        // Calculate chapter efficiency
        const chapterEfficiency = topicCount > 0 ? Math.round((totalEfficiency / topicCount) * 100) / 100 : 0;

        // Update chapter efficiency in `StudyData`
        await StudyData.updateMany(
            {
                user: userId,
                'chapter.name': chapterName,
            },
            {
                $set: {
                    'chapter.overall_efficiency': chapterEfficiency,
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Chapter ${chapterName} efficiency calculated: ${chapterEfficiency}`);

        // Calculate subject metrics after updating chapter efficiency
        await calculateSubjectMetrics(chapterData.subjectName, userId);

        // Calculate total questions solved and progress
        const result: Result = {
            overall_efficiency: chapterEfficiency,
            total_questions_solved: {
                number: solvedQuestionCount,
                percentage: totalQuestionsInBankCount > 0 ? Math.round((solvedQuestionCount / totalQuestionsInBankCount) * 100) : 0,
            },
            overall_progress: totalQuestionsInBankCount > 0 ? (solvedTopicsSet.size / topics.length) * 100 : 0,
        };

        return result;

    } catch (error) {
        console.error('Error calculating chapter metrics:', error);
        throw new Error('Failed to calculate chapter metrics');
    }
};
