import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { db } from '../../db/db'
import Planner from "../../models/plannerModel";

export const postFeedbackData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
        const body = req.body
        const {chapter, topic, level} = body

        if(!chapter || !topic) return next(new CustomError("Chapter and Topic required", 400))

        const sanitisedData = {
            chapter,
            topic,
            level,
            user: req.user
        }
        
        await db.collection("feedback").insertOne(sanitisedData) 

        res.status(200).json({
            success: true,
            message: "Done",
          });
        
    } catch (error: any) {
        console.log(error);
        next(new CustomError(error.message));
      }
  }


export const createPlanner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
        const allStudentData = await db.collection("feedback").find({ user: req.user }).toArray();

        

        

        const planner = await Planner.create({

        })

        res.status(200).json({
            success: true,
            message: "Done",
          });
        
    } catch (error: any) {
        console.log(error);
        next(new CustomError(error.message));
      }
  }


export const getPlanner = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
        const {date} = req.query

        const today = new Date().toISOString().split('T')[0];
        const query = { user: req.user, date: today };

        if(date) query.date = date.toString()

        const data = await Planner.find(query)
        
        res.status(200).json({
            success: true,
            data
          });
        
    } catch (error: any) {
        console.log(error);
        next(new CustomError(error.message));
      }
  }