import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { db } from "../../db/db";
import Planner from "../../models/plannerModel";
import { generateWeeklyPlanner } from "./Generate/generatePlanner";
import IUser from "../../types/IUser";
import { getBackRevistionTopics } from "./BackTopics/getBackTopics";
import { getDailyQuestions } from "./DailyQuestions/getDailyQuestions";
import moment from "moment";
import { getDailyTopics } from "./DailyTopics/getDailyTopics";
import IDataSchema from "../../types/IDataSchema";
import { StudyData } from "../../models/studentData";

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

export const updateDailyPlanner = async (  
  req: Request,
  res: Response,
  next: NextFunction) => {
  const today = moment().tz("Asia/Kolkata").startOf("day").toDate();
  const yesterday = moment().tz("Asia/Kolkata").subtract(1, 'days').startOf("day").toDate();

  const user: IUser = req.user

  const continuousRevisionTopics = (await StudyData.find({
    user: user._id,
    tag: "continuous_revision",
    createdAt: { $gte: yesterday },
  }).exec()) as IDataSchema[];

  const planner = await Planner.findOne({
    student: user._id,
    "days.date": today
  });

  if (!planner) {
    throw new Error(`Planner not found for user ${user._id} and date ${today}`);
  }

  const { dailyContinuousTopics, dailyBackTopics } = getDailyTopics(
    continuousRevisionTopics,
    [],
    user
  );

  dailyContinuousTopics.forEach(data => {
    if (!data.topic.studiedAt) {
      data.topic.studiedAt = [];
    }
    data.topic.studiedAt.push({ date: today, efficiency: 0 });
  });

  const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];

  const dailyQuestions = await getDailyQuestions(moment(today).format('dddd'), today, dailyTopics);

  await Planner.updateOne(
    { student: user._id, "days.date": today },
    {
      $set: {
        "days.$.continuousRevisionTopics": dailyContinuousTopics,
        "days.$.questions": dailyQuestions
      }
    }
  );

  continuousRevisionTopics.forEach(data => data.tag = "active_continuous_revision");
  await Promise.all(continuousRevisionTopics.map(data => data.save()));

  res.status(200).json({
    success: true,
    message: `Updated planner for user ${user._id} for date ${today}`,
    planner,
  });
};
export const getPlanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const today = moment().tz("Asia/Kolkata");
    const startOfWeek = today.clone().startOf('isoWeek'); 
    const endOfWeek = today.clone().endOf('isoWeek'); 
    const userId = req.user._id;

    const planner = await Planner.findOne({
      student: userId,
      startDate: { $gte: startOfWeek.toDate() },
      endDate: { $lte: endOfWeek.toDate() },
    });

    if (!planner) {
      return res.status(404).json({
        success: false,
        message: 'Planner not found for the current week',
      });
    }

    res.status(200).json({
      success: true,
      data: planner,
    });
  } catch (error: any) {
    console.error(error);
    next(new CustomError(error.message));
  }
};