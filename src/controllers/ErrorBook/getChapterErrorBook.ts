import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';
import { questions_db } from '../../db/db'; // Import your questions_db connection

export interface EQuestion {
  _id: string;
  question: string; 
  options: Array<{
    name: string;
    tag: string;
    images: string | null;
    _id: string;
  }>;
  chapter: string[];
  subject: string;
  topics: string[];
  images: [],
  subtopics: string[];
  level: string; 
}

export interface ErrorBookQuestion {
  _id: string;
  question: EQuestion; 
}

export const getChapterErrorBook = async (req: Request, res: Response, next: NextFunction) => {
  const chapterName = req.params.chapter;

  try {
    // Fetch all solved questions for the user where isCorrect is false
    const solvedQuestions = await SolvedQuestions.find({
      student: req.user._id,
      isCorrect: false,
    }).select('question');

    // Extract the question IDs from the solved questions
    const questionIds = solvedQuestions.map((solvedQuestion) => solvedQuestion.question);

    //Fetch the full questions from the questionbanks collection in questions_db, filtered by chapter name
    const questions = await questions_db
      .collection('questionbanks')
      .find({
        _id: { $in: questionIds }, 
        chapter: chapterName, 
      })
      .toArray();

    const chapterErrorBook: ErrorBookQuestion[] = questions.map((question) => ({
      _id: question._id.toString(), 
      question: {
        _id: question._id.toString(),
        question: question.question, 
        options: question.options.map((option: any) => ({
          name: option.name, 
          tag: option.tag,
          images: option.images,
          _id: option._id.toString(),
        })),
        chapter: question.chapter,
        subject: question.subject,
        topics: question.topics,
		    images: question.images,
        subtopics: question.subtopics,
        level: question.level, 
      },
    }));

    if (chapterErrorBook.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No chapter ErrorBook data found for this user',
      });
    }


    return res.status(200).json({
      success: true,
      chapterErrorBook, 
    });
  } catch (error: any) {
    console.error('Error in getChapterErrorBook:', error);
    next(new CustomError(error.message));
  }
};
