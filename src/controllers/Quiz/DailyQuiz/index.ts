import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
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
import { questions_db } from "../../../db/db";

export const saveDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data, questions } = req.body;

    const user = req.user as IUser;

    let topic = data

    if(data?.isSubtopic) {
       const subtopicDetails = await questions_db.collection('subtopics').findOne({_id: new mongoose.Types.ObjectId(data._id)})
       if(!subtopicDetails) return next(new CustomError("Subtopic not found"))

       const topicOfsubtopic = await questions_db.collection("topics").findOne({_id: new mongoose.Types.ObjectId(subtopicDetails.topicId)})
       if(!topicOfsubtopic) return next(new CustomError("Topic of subtopic not found"))

       topic = topicOfsubtopic
    }

    // Validate request body
    if (!topic || !Array.isArray(questions) || questions.length === 0) {
      return next(new CustomError("Invalid request body: 'topic' or 'questions' are missing or incorrectly formatted", 400));
    }

    // Validate question structure and check if each question has a valid ObjectId
    const invalidQuestion = questions.find(
      (q) =>
        !q.question ||
        !mongoose.Types.ObjectId.isValid(q.question) || // Check if question is a valid ObjectId
        q.studentAnswer === undefined ||
        q.isCorrect === undefined ||
        !q.tag
    );
    if (invalidQuestion) {
      return next(new CustomError("Invalid question format or question ID in the request", 400));
    }

    // Process each question: Update if it exists, otherwise create a new entry
    for (const ques of questions) {
      await SolvedQuestions.findOneAndUpdate(
        {
          student: user._id,
          question: ques.question, // Ensure we update based on question and student ID
        },
        {
          $set: {
            studentAnswer: ques.studentAnswer,
            isCorrect: ques.isCorrect,
            tag: ques.tag,
            timeTaken: ques?.timeTaken,
          },
        },
        { upsert: true, new: true } // Use upsert to create a new document if none exists
      );
    }

    // After all questions are processed, handle further operations
    await insertCompletedTopics(user._id, data, questions);

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
