import mongoose from "mongoose";
import { calculateTopicMetrics } from "../../../functions/CalculateMetrices/calculateTopicMetrics";
import updateStudentTracker from "../../../functions/Tracker/UpdateTracker";
import { updateStreak } from "../../../helpers/updateStreak";
import SolvedQuestions from "../../../models/solvedQuestions";
import { Topic } from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";

type IData = {
    user: IUser, 
    topic: Topic,
    ques: {
        question: any,
        studentAnswer: any,
        isCorrect: boolean,
        tag: string
    },
    timeTaken?: number,
    quizId: string
}

export const saveQuizQuestions = async (data: IData) => {
    try {
        const { user, topic, ques, quizId, timeTaken } = data;
        const topics = [topic];
        const { question, studentAnswer, isCorrect, tag } = ques;

        if (!mongoose.Types.ObjectId.isValid(question)) {
            throw new Error("Invalid question format: question must be a valid ObjectId");
        }

        if (!ques || studentAnswer === undefined || isCorrect === undefined || !tag) {
            throw new Error("Invalid question format");
        }

        // Check if the question for this user already exists and update it
        const existingQuestion = await SolvedQuestions.findOneAndUpdate(
            {
                student: user._id,
                question,
                quizId,
            },
            {
                $set: {
                    studentAnswer,
                    isCorrect,
                    tag,
                    timeTaken,
                },
            },
            { new: true, upsert: true } // 'upsert' will create a new entry if none is found
        );

        // Ensure that metrics and trackers are updated based on the topic
        await updateStudentTracker(topic.name, user);
        await calculateTopicMetrics(topics, user);
        await updateStreak(user);

        return { success: true, message: "Saved" };
    } catch (error) {
        console.error(error);
        return { success: false, message: (error as Error).message };
    }
};
