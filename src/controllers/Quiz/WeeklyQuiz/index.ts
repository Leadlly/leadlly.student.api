import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../middlewares/error";
import { questions_db } from "../../../db/db";
import IUser from "../../../types/IUser";

import { Quiz } from "../../../models/quizModel";
import { saveQuizQuestionsQueue } from "../../../services/bullmq/producer";
import { create_weekly_quiz } from "./functions/create_weekly_quiz";

export const createWeeklyQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: IUser = req.user;

    const result = (await create_weekly_quiz(user)) as {
      status: number;
      message?: string;
      data?: any;
    };

    return res.status(result.status).json({
      success: true,
      message: result?.message,
      weeklyQuiz: result?.data,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const getWeeklyQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;

    // const userObjectId = new mongoose.Types.ObjectId(userId);

    let query: any = {
      user: userId,
      quizType: "weekly",
    };

    if (req.query.attempted === "attempted") {
      query.attempted = true;
    } else {
      query.attempted = false;
    }

    const weeklyQuiz = await Quiz.find(query).sort({ createdAt: -1 });

    if (!weeklyQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quizzes does not exist for the current week",
      });
    }

    res.status(200).json({
      success: true,
      weeklyQuiz,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const getWeeklyQuizQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.query;

    // Fetch the specific quiz for the user based on quizId
    const weeklyQuiz = await Quiz.findOne({
      _id: quizId,
    });

    if (!weeklyQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz does not exist for the current week",
      });
    }

    // Extract question IDs from the quiz (flatten all questions across topics)
    const questionIds: any = Object.values(weeklyQuiz.questions).flat();

    // Fetch full question details from the questionbank collection
    const questionsCollection = questions_db.collection("questionbanks");
    const fullQuestionDetails = await questionsCollection
      .find({ _id: { $in: questionIds } })
      .toArray();

    // Send the detailed quiz questions directly without grouping by topics
    res.status(200).json({
      success: true,
      data: {
        weeklyQuestions: fullQuestionDetails,
        startDate: weeklyQuiz.createdAt,
        endDate: weeklyQuiz.endDate,
      },
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const saveQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic, question, quizId } = req.body;

    if (!topic || !question || !quizId) {
      throw new Error("Invalid quiz entry format");
    }

    await saveQuizQuestionsQueue.add("quizQuestion", {
      user: req.user,
      topic,
      ques: question,
      quizId,
    });

    res.status(200).json({
      success: true,
      message: "Question added to queue",
    });
  } catch (error: any) {
    console.error(error);
    next(new CustomError(error.message));
  }
};
