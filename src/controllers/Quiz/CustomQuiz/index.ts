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

        const { subjects, chapters, topics, numberOfQuestions } = req.body;

        if (!numberOfQuestions || numberOfQuestions <= 0) {
            return next(new CustomError("Invalid number of questions", 400));
        }

        const Questions: Collection = questions_db.collection("questionbanks");
        let allQuestions: any[] = [];

        for (let subject of subjects) {
            for (let chapter of chapters) {
                for (let topic of topics) {
                    const query = {
                        subject: subject,
                        chapter: chapter,
                        topics: topic
                    };

                    const questions = await Questions.find(query).toArray();
                    allQuestions = allQuestions.concat(questions);
                }
            }
        }

        // Shuffle the questions
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);

        // Slice to get the required number of questions
        const selectedQuestions = allQuestions.slice(0, numberOfQuestions);

        const customQuiz = await Quiz.create({
            user: user._id,
            questions: selectedQuestions,
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
                totalQuestions: selectedQuestions.length,
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