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

        // Create the quiz
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
      const customQuiz = await Quiz.findOne({
        _id: req.query.quizId,
        user: req.user._id,
        quizType: "custom",
      });
  
      if (!customQuiz) {
        return res.status(404).json({
          success: false,
          message: "Custom quiz does not exist",
        });
      }
  
      const customQuizQuestions = Object.values(customQuiz.questions).flat();
  
      res.status(200).json({
        success: true,
        data: {
          customQuizQuestions,
          startDate: customQuiz.createdAt,
          endDate: customQuiz.endDate,
        },
      });
    } catch (error: any) {
      next(new CustomError(error.message));
    }
  };

