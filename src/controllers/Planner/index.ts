import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { db } from "../../db/db";
import Planner from "../../models/plannerModel";
import { generateWeeklyPlanner } from "./Generate/generatePlanner";
import IUser from "../../types/IUser";
import { getBackRevistionTopics } from "./BackTopics/getBackTopics";

export const createPlanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user: IUser = req.user;

    const backRevisionTopics = await getBackRevistionTopics(user._id, user.subscription.dateOfActivation!)

    const generatedPlanner = await generateWeeklyPlanner(
      user, backRevisionTopics
    );
    const planner = await Planner.create(generatedPlanner);

    res.status(200).json({
      success: true,
      message: "Done",
      planner,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const getPlanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { date } = req.query;

    const today = new Date().toISOString().split("T")[0];
    const query = { user: req.user, date: today };

    if (date) query.date = date.toString();

    const data = await Planner.find(query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};
