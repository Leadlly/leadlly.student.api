import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { db } from '../../db/db'
import Planner from "../../models/plannerModel";
import { generateWeeklyPlanner } from "./Generate/generatePlanner";
import { StudyData } from "../../models/studentData";
import { scheduleActions } from "./actions";
import IDataSchema from "../../types/IDataSchema";
import IUser from "../../types/IUser";

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
      const user: IUser = req.user;
      const allStudentData: IDataSchema[] = await StudyData.find({ user: user._id });
  
      const { standard, schedule } = user.about;
  
      if (standard && schedule && scheduleActions[standard] && scheduleActions[standard][schedule]) {
        const action = scheduleActions[standard][schedule];
        await action(req, res, next); // Execute the appropriate action based on standard and schedule
      } else {
        throw new Error('Unsupported standard or schedule');
      }
  
      const generatedPlanner = await generateWeeklyPlanner('666a01a69461d46dc3c7b5fb');
      const planner = await Planner.create(generatedPlanner);
  
      res.status(200).json({
        success: true,
        message: "Done",
        planner,
      });
  
    } catch (error: any) {
      console.log(error);
      next(new CustomError(error.message));
    }
  };

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