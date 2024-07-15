import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../../middlewares/error";
import { db } from "../../../db/db";

export const createCustomQuiz = async(req: Request, res: Response, next: NextFunction) => {
   try {
       const Questions = db.collection("questionbanks");  
       const { subjects, chapters, topics, questionsNumber, level } = req.body;

       // Build the match filter
       const matchFilter = {
           subject: { $in: subjects },
           chapter: { $in: chapters },
           topics: { $in: topics },
           level: level
       };

       const totalCategories = subjects.length + chapters.length + topics.length;
       const questionsPerCategory = Math.floor(questionsNumber / totalCategories);

       const questions = await Questions.aggregate([
           { $match: matchFilter },
           { $sample: { size: questionsNumber } }, 
           { $group: {
               _id: {
                   subject: "$subject",
                   chapter: "$chapter",
                   topics: "$topics"
               },
               questions: { $push: "$$ROOT" }
           }},
           { $project: {
               questions: { $slice: ["$questions", questionsPerCategory] } 
           }},
           { $unwind: "$questions" },
           { $replaceRoot: { newRoot: "$questions" } },
           { $limit: questionsNumber }
       ]).toArray();

       res.json({ questions });
   } catch (error: any) {
       console.log(error);
       next(new CustomError(error.message));
   }
}
