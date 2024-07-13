import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../../middlewares/error";

export const createCustomQuiz = async(req: Request, res: Response, next: NextFunction) => {
   try {
    const {subjects, chapters, topics} = req.body
    
   } catch (error: any) {
    console.log(error)
    next(new CustomError(error.message))
   }
}