import { calculateTopicMetrics } from "../../../functions/CalculateMetrices/calculateTopicMetrics";
import SolvedQuestions from "../../../models/solvedQuestions";
import { Topic } from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";
import { updateStreak } from "./updateUserDetails";

type IData = {
    user: IUser, 
    topic: Topic,
    ques: {
        question: any,
        studentAnswer: any,
        isCorrect: boolean,
        tag: string
    },
    quizId: string
}

export const saveQuizQuestions = async (data: IData) => {
    try {
        const { user, topic, ques, quizId } = data;

        const topics = [topic];

        const { question, studentAnswer, isCorrect, tag } = ques;

        if (!ques || studentAnswer === undefined || isCorrect === undefined || !tag) {
            throw new Error("Invalid question format");
        }

        await SolvedQuestions.create({
            student: user._id,
            question,
            studentAnswer,
            isCorrect,
            tag,
            quizId,
        });

        // Calculate topic metrics
        await calculateTopicMetrics(topics, user);
        await updateStreak(user)

        return { success: true, message: "Saved" };
    } catch (error) {
        console.error(error);
        return { success: false, message: (error as Error).message };
    }
}
