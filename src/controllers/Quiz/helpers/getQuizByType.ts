import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../../middlewares/error";
import { Quiz } from "../../../models/quizModel";

export const getQuizQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizId = req.query.quizId as string;
    const quizType = req.query.quizType as string;  
    console.log(quizId);
    console.log(quizType);
    
    if (!quizId || !quizType) {
      return res.status(400).json({
        success: false,
        message: "Missing quizId or quizType",
      });
    }

    // Fetch the quiz based on type (weekly or custom)
    const quiz = await Quiz.findOne({
      _id: quizId,
      user: req.user._id,
      quizType: quizType,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: `${quizType.charAt(0).toUpperCase() + quizType.slice(1)} quiz does not exist`,
      });
    }

    const quizQuestions = Object.values(quiz.questions).flat();

    res.status(200).json({
      success: true,
      data: {
        quizQuestions,
        startDate: quiz.createdAt,
        endDate: quiz.endDate,
      },
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};
