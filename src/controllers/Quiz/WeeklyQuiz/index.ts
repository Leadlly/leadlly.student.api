import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../middlewares/error";
import { questions_db } from "../../../db/db";
import IUser from "../../../types/IUser";
import moment from "moment-timezone";
import Planner from "../../../models/plannerModel";
import { Collection } from "mongodb";
import SolvedQuestions from "../../../models/solvedQuestions";
import { Quiz } from "../../../models/quizModel";
import { saveQuizQuestionsQueue } from "../../../services/bullmq/producer";

export const createWeeklyQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: IUser = req.user;

    const activationDate =
      user.freeTrial.dateOfActivation || user.subscription.dateOfActivation;
    if (!activationDate) {
      return next(new CustomError("Not subscribed", 400));
    }

    const timezone = "Asia/Kolkata";
    const currentMoment = moment.tz(timezone);

    // Calculate the start and end of next week
    const startDate = moment(currentMoment).startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();

    const currentWeekPlanner = await Planner.findOne({
      student: user._id,
      startDate,
      endDate,
    });

    if (!currentWeekPlanner) {
      return new CustomError("Planner for current week does not exist!");
    }

    // Get current week's Back Revision Topics
    const currentWeekBackRevisionTopics = currentWeekPlanner.days
      .map((day) => day.backRevisionTopics)
      .flatMap((item) => item);

    // Get current week's Continuous Revision Topics
    const currentWeekContinuousRevisionTopics = currentWeekPlanner.days
      .map((day) => day.continuousRevisionTopics)
      .flatMap((item) => item);

    const weeklyTopics = [
      ...currentWeekContinuousRevisionTopics,
      ...currentWeekBackRevisionTopics,
    ];

    const questions: Collection = questions_db.collection("questionbanks");
    const results: { [key: string]: any[] } = {};
    const categories = [
      "jeemains_easy",
      "neet",
      "boards",
      "jeemains",
      "jeeadvance",
    ];

    // Determine which standards to include based on the user's standard
    const userStandard = user.academic.standard;
    let standardsToFetch = [userStandard];

    if (userStandard === 13) {
      standardsToFetch = [11, 12]; // Include questions for standards 11 and 12
    }

    for (let topicData of weeklyTopics) {
      const topic = topicData.topic.name;
      results[topic] = [];
      let remainingQuestions = 2;

      for (let category of categories) {
        if (remainingQuestions > 0) {
          const query = {
            topics: topic,
            level: category,
            standard: { $in: standardsToFetch },
          };
          const topicQuestions = await questions
            .aggregate([
              { $match: query },
              { $sample: { size: remainingQuestions } },
            ])
            .toArray();

          for (const topicData of topicQuestions) {
            const solvedQuestions = await SolvedQuestions.findOne({
              student: user._id,
              "question.question": topicData._id,
            });

            if (!solvedQuestions) {
              // Store only the question ID instead of the full question
              results[topic].push(topicData._id);
              remainingQuestions -= topicQuestions.length;
            }
          }
        } else {
          break;
        }
      }
    }

    function getNextSaturday(date: Date) {
      const result = new Date(date);
      result.setDate(result.getDate() + ((6 - result.getDay() + 7) % 7));
      return result;
    }

    const weeklyQuiz = await Quiz.create({
      user: user._id,
      questions: results,
      quizType: "weekly",
      createdAt: new Date(),
      endDate: getNextSaturday(new Date()),
    });

    return res.status(200).json({
      success: true,
      message: "Weekly quiz created successfully!",
      weeklyQuiz,
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
    // Fetch the specific quiz for the user based on quizId
    const weeklyQuiz = await Quiz.findOne({
      _id: req.query.quizId,
      user: req.user._id,
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

    const { topic, question, quizId } = req.body

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

