import { NextFunction, Request, Response } from "express";
import SolvedQuestions from "../../../models/solvedQuestions";
import { calculateTopicMetrics } from "../../../functions/CalculateMetrices/calculateTopicMetrics";
import { CustomError } from "../../../middlewares/error";
import { calculateStudentReport } from "../../../helpers/studentReport";
import { insertCompletedTopics } from "./helpers/insertCompletedTopics";

export const saveDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, questions } = req.body;

    if (!topic || !questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }

    const topics = [topic];
    
    const createQuestionPromises = questions.map((ques) => {
      const { question, studentAnswer, isCorrect, tag } = ques;

      if (!question || studentAnswer === undefined || isCorrect === undefined || !tag) {
        return Promise.reject(new Error("Invalid question format"));
      }

      return SolvedQuestions.create({
        student: req.user._id,
        question,
        studentAnswer,
        isCorrect,
        tag,
      });
    });


    await insertCompletedTopics(req.user._id, topic, questions)

    await Promise.all(createQuestionPromises);
    await calculateTopicMetrics(topics, req.user);
    await calculateStudentReport(req.user._id);

    res.status(200).json({
      success: true,
      message: "Saved",
    });
  } catch (error: any) {
    console.error(error);
    next(new CustomError(error.message)); 
  }
};
