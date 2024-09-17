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

    // Get current weeks Back Revision Topics
    const currentWeekBackRevisionTopics = currentWeekPlanner.days
      .map((day) => day.backRevisionTopics)
      .flatMap((item) => item);

    // Get current weeks Continuous Revision Topics
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

    for (let topicData of weeklyTopics) {
      const topic = topicData.topic.name;
      results[topic] = [];
      let remainingQuestions = 2;

      for (let category of categories) {
        if (remainingQuestions > 0) {
          const query = { topics: topic, level: category };
          const topicQuestions = await questions
            .aggregate([
              { $match: query },
              { $sample: { size: remainingQuestions } },
            ])
            .toArray();

          topicQuestions.map(async (topicData: any) => {
            const solvedQuestions = await SolvedQuestions.findOne({
              student: user._id,
              "question.question": topicData.question,
            });

            if (!solvedQuestions) {
              results[topic].push(topicData);
              remainingQuestions -= topicQuestions.length;
            }
          });
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
    const weeklyQuiz = await Quiz.findOne({
      _id: req.query.quizId,
      user: req.user._id,
    });

    if (!weeklyQuiz) {
      return res.status(404).json({
        success: false,
        message: "Quizzes does not exist for the current week",
      });
    }

    const weeklyQuestions = Object.values(weeklyQuiz.questions).flat();

    res.status(200).json({
      success: true,
      data: {
        weeklyQuestions,
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

export const getReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId } = req.query;

    if (typeof quizId !== "string") {
      return next(new CustomError("Invalid quizId", 400));
    }

    const getQuiz = await Quiz.findById(quizId).lean();

    if (!getQuiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    const topicCovered = Object.entries(getQuiz.questions);
    const topicsSet: any[] = [];

    await Promise.all(
      topicCovered.map(async (topicItem: any) => {
        const questionsArray = topicItem[1][0];
        if (questionsArray && typeof questionsArray === "object") {
          const topicName = questionsArray.topics;

          if (topicName) {
            topicsSet.push(topicName);
          }
        }
      })
    );

    const topics = [
      ...new Set(
        topicsSet.flatMap((item) =>
          item !== null && item !== undefined
            ? Array.isArray(item)
              ? item
              : [item]
            : []
        )
      ),
    ];
    const topicsWithEfficiency: any[] = [];
    let questions;
    await Promise.all(
      topics.map(async (topic: any) => {
        questions = await SolvedQuestions.find({
          "question.topics": topic,
          quizId,
          student: req.user,
        });

        const totalQuestions = questions.length;
        const correctAnswers = questions.filter((q: any) => q.isCorrect).length;

        const efficiency = (correctAnswers / totalQuestions) * 100;
        topicsWithEfficiency.push({
          topic,
          efficiency: isNaN(efficiency) ? 0 : efficiency.toFixed(2),
        });
      })
    );
    res.status(200).json({
      status: 200,
      topicsWithEfficiency,
      questions,
    });
  } catch (error: any) {
    console.error(error);
    next(
      new CustomError(
        error.message || "An error occurred while getting the report",
        500
      )
    );
  }
};
