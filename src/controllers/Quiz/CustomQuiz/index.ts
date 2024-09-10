import { getQuizQuestions } from './../helpers/getQuizByType';
import { saveQuizQuestionsQueue } from './../../../services/bullmq/producer';
import { Collection } from 'mongodb';
import moment from "moment-timezone";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../../middlewares/error";
import { db, questions_db } from "../../../db/db";
import IUser from "../../../types/IUser";
import { Quiz } from "../../../models/quizModel";

export const createCustomQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: IUser = req.user;

        const activationDate = user.freeTrial.dateOfActivation || user.subscription.dateOfActivation;
        if (!activationDate) {
            return next(new CustomError("Not subscribed", 400));
        }

        const { subjects, chapters, topics } = req.body;

        const Questions: Collection = questions_db.collection("questionbanks");
        const results: { [key: string]: any[] } = {};

        for (let subject of subjects) {
            const query = {
                subject: subject,
                topics: { $in: topics },
                chapter: { $in: chapters }
            };

            const subjectQuestions = await Questions.find(query).toArray();
 
            results[subject] = subjectQuestions;
        }

        const allQuestions = Object.values(results).flat();

        const customQuiz = await Quiz.create({
            user: user._id,
            questions: allQuestions,
            quizType: "custom",
            createdAt: new Date(),
            endDate: moment().add(7, 'days').toDate(),
        });

        return res.status(200).json({
            success: true,
            message: "Custom quiz created successfully!",
            data: {
                customQuiz,
                startDate: customQuiz.createdAt,
                endDate: customQuiz.endDate,
            },
        });

    } catch (error: any) {
        next(new CustomError(error.message));
    }
};

export const getCustomQuiz = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user._id;
  
      // Query to find all custom quizzes created by the user
      const customQuizzes = await Quiz.find({ user: userId, quizType: "custom" }).sort({ createdAt: -1 });
  
      if (customQuizzes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No custom quizzes found for this user.",
        });
      }
  
      res.status(200).json({
        success: true,
        customQuizzes,
      });
    } catch (error: any) {
      next(new CustomError(error.message));
    }
  };

  export const getCustomQuizQuestions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      req.query.quizType = "custom";  
      await getQuizQuestions(req, res, next);  
    } catch (error: any) {
      next(new CustomError(error.message));
    }
  };

  export const saveCustomQuizAnswers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { topic, question, quizId } = req.body;
  
      if (!topic || !question || !quizId) {
        throw new Error("Invalid quiz entry format");
      }

      await saveQuizQuestionsQueue.add('customQuizQuestion', {
        user: req.user,
        topic,
        ques: question,
        quizId,
      });
  
      res.status(200).json({
        success: true,
        message: "Custom quiz question added to queue for saving",
      });
    } catch (error: any) {
      console.error(error);
      next(new CustomError(error.message));
    }
  };