import { getQuizQuestions } from './../helpers/getQuizByType';
import { saveQuizQuestionsQueue } from './../../../services/bullmq/producer';
import { Collection } from 'mongodb';
import moment from "moment-timezone";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../../middlewares/error";

import IUser from "../../../types/IUser";
import { Quiz } from "../../../models/quizModel";
import { questions_db } from '../../../db/db';

const getExamTags = (competitiveExam?: string): string[] => {
    switch (competitiveExam?.toLowerCase()) {
      case 'jee':
        return ['jeemains', 'jeeadvance'];
      case 'neet':
        return ['neet'];
      case 'boards':
        return ['boards'];
      default:
        return [];
    }
  };
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
    
    // Create an aggregation pipeline to randomly select questions
    const pipeline = [
      { $match: { subject: { $in: subjects }, chapter: { $in: chapters }, topics: { $in: topics } } },
      { $sample: { size: numberOfQuestions } }
    ];

    const allQuestions = await Questions.aggregate(pipeline).toArray();

    if (allQuestions.length === 0) {
      return next(new CustomError("No questions found for the given criteria", 404));
    }

    // Organize the selected questions by topic
    let questionsObject: { [key: string]: any[] } = {};
    for (let question of allQuestions) {
      const topic = question.topics;
      if (!questionsObject[topic]) {
        questionsObject[topic] = [];
      }
      questionsObject[topic].push(question);
    }

    // Save the custom quiz
    const customQuiz = await Quiz.create({
      user: user._id,
      questions: questionsObject,
      quizType: "custom",
      createdAt: new Date(),
      endDate: moment().add(7, 'days').toDate(),
    });

    return res.status(200).json({
      success: true,
      message: "Custom quiz created successfully!",
      data: {
        customQuiz: {
          ...customQuiz.toObject(),
          questions: questionsObject,
        },
        startDate: customQuiz.createdAt,
        endDate: customQuiz.endDate,
        totalQuestions: allQuestions.length,
      },
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const getCreatedCustomQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    const { quizId } = req.params;

    if (!quizId) {
      return next(new CustomError("Quiz ID is required", 400));
    }

    // Fetch the custom quiz created by the user based on quizId
    const customQuiz = await Quiz.findOne({ _id: quizId, user: user._id });

    if (!customQuiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    return res.status(200).json({
      success: true,
      message: "Custom quiz retrieved successfully",
      data: {
        customQuiz,
        startDate: customQuiz.createdAt,
        endDate: customQuiz.endDate,
        totalQuestions: Object.values(customQuiz.questions).flat().length,
      },
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
      // req.query.quizType = "custom";  
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

  export const getTopicsForChapters = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { standard, subjects, chapters } = req.body;
      const competitiveExam = req.user?.academic?.competitiveExam;;
        console.log(req.body);
        
      if (!standard || !subjects || !Array.isArray(subjects) || subjects.length === 0 || 
          !chapters || !Array.isArray(chapters) || chapters.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid input. Please provide standard, a non-empty array of subjects, and a non-empty array of chapters.",
        });
      }
  
      let standardQuery: any;
      if (standard === "13") {
        standardQuery = { $in: ["11", "12"] };
      } else {
        standardQuery = { $regex: new RegExp(`^${standard}$`, "i") };
      }
  
      const examTags = getExamTags(competitiveExam);
      
      const topicsPromises = chapters.map(async (chapter) => {
        if (!chapter) {
          console.log("Skipping null or undefined chapter");
          return null;
        }
  
        const topicQuery = {
          standard: standardQuery,
          subjectName: { $in: subjects.map(subject => new RegExp(`^${subject}$`, "i")) },
          chapterName: new RegExp(`^${chapter}$`, "i"),
          exam: { $in: examTags },
        };
        
        console.log(topicQuery);
        
        const topics = await questions_db
          .collection("topics")
          .find(topicQuery)
          .toArray();
        
       console.log(topics);
       
        
        if (topics.length === 0) {
          console.log(`No topics found for chapter: ${chapter}`);
          return null;
        }
        
        return {
          chapter,
          topics: topics.map(topic => ({
            _id: topic._id,
            name: topic.name,
            subject: topic.subjectName,
          })),
        };
      });
  
      const results = (await Promise.all(topicsPromises)).filter(Boolean);
  
      if (results.length === 0) {
        console.log("No topics found for any chapters");
        return res.status(404).json({
          success: false,
          message: "No topics found for the given criteria.",
        });
      }
      res.status(200).json({
        success: true,
        topics: results,
      });
    } catch (error: any) {
      console.error("Error in getTopicsForChapters:", error);
      next(new CustomError(error.message));
    }
  };