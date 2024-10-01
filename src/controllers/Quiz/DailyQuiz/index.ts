import { NextFunction, Request, Response } from "express";
import SolvedQuestions from "../../../models/solvedQuestions";
import { calculateTopicMetrics } from "../../../functions/CalculateMetrices/calculateTopicMetrics";
import { CustomError } from "../../../middlewares/error";
import { calculateStudentReport } from "../../../helpers/studentReport";
import { insertCompletedTopics } from "./helpers/insertCompletedTopics";
import updateStudentTracker from "../../../functions/Tracker/UpdateTracker";
import { updateStreak } from "../../../helpers/updateStreak";
import { updatePointsNLevel } from "../../../helpers/updatePointsNLevel";
import IUser from "../../../types/IUser";
import User from "../../../models/userModel";

export const saveDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, questions } = req.body;
    const user = req.user as IUser;

    if (!topic || !Array.isArray(questions) || questions.length === 0) {
      return next(new CustomError("Invalid request body: 'topic' or 'questions' are missing or incorrectly formatted", 400));
    }

    const invalidQuestion = questions.find(
      (q) =>
        !q.question ||
        q.studentAnswer === undefined ||
        q.isCorrect === undefined ||
        !q.tag
    );
    if (invalidQuestion) {
      return next(new CustomError("Invalid question format in the request", 400));
    }

    // Bulk insert questions
    const solvedQuestions = questions.map((ques) => ({
      student: user._id,
      question: ques.question,
      studentAnswer: ques.studentAnswer,
      isCorrect: ques.isCorrect,
      tag: ques.tag,
      timeTaken: ques?.timeTaken
    }));

    await SolvedQuestions.insertMany(solvedQuestions);

    await insertCompletedTopics(user._id, topic, questions);

    // Calculate topic metrics first
    await calculateTopicMetrics([topic], user);

    // Update the student tracker
    await updateStudentTracker(topic.name, user);

    // Calculate the student report and update streak
    await Promise.all([calculateStudentReport(user._id), updateStreak(user)]);

    // Re-fetch user details after calculateStudentReport
    const updatedUser = await User.findById(user._id).select("details.report");

    // If the session condition is met, update points and level
    if (updatedUser?.details?.report?.dailyReport?.session === 100) {
      await updatePointsNLevel(updatedUser._id);
    }

    return res.status(200).json({
      success: true,
      message: "Saved successfully",
    });
  } catch (error: any) {
    console.error(error);
    return next(new CustomError(`Error occurred while saving quiz: ${error.message}`, 500));
  }
};
