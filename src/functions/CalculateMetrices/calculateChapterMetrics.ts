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
        const topics = await questions_db.collection("topics").aggregate([
            { $match: { chapterName: chapterName } }
        ]).toArray();

        const chapterData = await questions_db.collection("chapters").findOne( {name: chapterName} )
        if(!chapterData) throw new CustomError('No chapter data', 404)

        let totalEfficiency = 0;
        let topicCount = topics.length;

        const solvedTopicsSet = new Set();
        const totalQuestionsInBankCount = await questions_db.collection("questionbanks").countDocuments({
            "chapter": chapterName
        });

        const solvedQuestionCount = await SolvedQuestions.countDocuments({
            student: userId,
            "question.chapter": chapterName
        });

        for (let topic of topics) {
                const studyData = await StudyData.findOne({
                    user: userId,
                    'topic.name': topic.name,
                    'chapter.name': chapterName,
                }) as IDataSchema;

                if (studyData) {
                    totalEfficiency += studyData.topic.overall_efficiency || 0;
                }

            const solvedCount = await SolvedQuestions.countDocuments({
                student: userId,
                "question.chapter": chapterName,
                "question.topics": topic.name
            });

            if (solvedCount > 0) {
                solvedTopicsSet.add(topic.name);
            }
        }

        const chapterEfficiency = topicCount > 0 ? Math.round((totalEfficiency / topicCount) * 100) / 100 : 0;
        

        // Update chapter efficiency in StudyData model
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
        await calculateSubjectMetrics(chapterData.subjectName, userId);

        // Calculate total questions solved
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
