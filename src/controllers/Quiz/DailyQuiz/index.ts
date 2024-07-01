import { NextFunction, Request, Response } from "express";
import SolvedQuestions from "../../../models/solvedQuestions";
import { calculateEfficiency } from "../../../helpers/Efficiency/calculateEfficiency";

export const saveDailQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { topic, questions, studentAnswer, isCorrect, tag } = req.body;

    const topics = [];
    topics.push(topic);
    for (let question of questions) {
      await SolvedQuestions.create({
        question,
        studentAnswer,
        isCorrect,
        tag
      });
    }

    await calculateEfficiency(topics, req.user);

    res.status(200).json({
      sucess: true,
      message: "Saved",
    });
  } catch (error) {
    console.log(error);
  }
};
