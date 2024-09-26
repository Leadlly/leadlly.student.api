import { NextFunction, Request, Response } from "express";
import SolvedQuestions from "../../../models/solvedQuestions";
import { calculateTopicMetrics } from "../../../functions/CalculateMetrices/calculateTopicMetrics";
import { CustomError } from "../../../middlewares/error";
import { calculateStudentReport } from "../../../helpers/studentReport";
import { insertCompletedTopics } from "./helpers/insertCompletedTopics";
import { updateStreak } from "../helpers/updateUserDetails";
import updateStudentTracker from "../../../functions/Tracker/UpdateTracker";

export const saveDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { topic, questions } = req.body;

    if (!topic || !Array.isArray(questions) || questions.length === 0) {
      return next(new CustomError("Invalid request body: 'topic' or 'questions' are missing or incorrectly formatted", 400));
    }

    const invalidQuestion = questions.find((q) => !q.question || q.studentAnswer === undefined || q.isCorrect === undefined || !q.tag);
    if (invalidQuestion) {
      return next(new CustomError("Invalid question format in the request", 400));
    }

    // Bulk insert questions
    const solvedQuestions = questions.map((ques) => ({
      student: req.user._id,
      question: ques.question,
      studentAnswer: ques.studentAnswer,
      isCorrect: ques.isCorrect,
      tag: ques.tag,
    }));

    await SolvedQuestions.insertMany(solvedQuestions);

    await insertCompletedTopics(req.user._id, topic, questions);
    
    // Calculate topic metrics first
    await calculateTopicMetrics([topic], req.user);

    //update the student tracker
    await updateStudentTracker(topic.name, req.user);

    // Calculate the student report and update the streak in parallel
    await Promise.all([
      calculateStudentReport(req.user._id),
      updateStreak(req.user),
    ]);

    return res.status(200).json({
      success: true,
      message: "Saved successfully",
    });
  } catch (error: any) {
    console.error(error);
    return next(new CustomError(`Error occurred while saving quiz: ${error.message}`, 500));
  }
};
