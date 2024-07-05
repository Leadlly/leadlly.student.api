import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { db } from "../../db/db";
import Planner from "../../models/plannerModel";
import { generateWeeklyPlanner } from "./Generate/generatePlanner";
import IUser from "../../types/IUser";
import { getBackRevisionTopics } from "./BackTopics/getBackTopics";
import { getDailyQuestions } from "./DailyQuestions/getDailyQuestions";
import moment from "moment-timezone";
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

    const activationDate = user.freeTrial.dateOfActivation || user.subscription.dateOfActivation;
    if (!activationDate) {
      return next(new CustomError("Not subscribed", 400));
    }

    const backRevisionTopics = await getBackRevisionTopics(
      user._id,
      activationDate,
    );

    const result = await generateWeeklyPlanner(user, backRevisionTopics);

    user.planner = true
    await user.save()

    res.status(200).json({
      success: true,
      message: result.message,
      planner: result.planner,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const updateDailyPlanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const timezone = "Asia/Kolkata";

  // Get today and yesterday in IST
  const todayIST = moment().tz(timezone).startOf("day");
  const yesterdayIST = moment().tz(timezone).subtract(1, "days").startOf("day");

  // Convert today and yesterday to UTC
  const todayUTC = todayIST.clone().utc().toDate();
  const yesterdayUTC = yesterdayIST.clone().utc().toDate();

  console.log(yesterdayUTC, "hello", todayUTC);

  const user: IUser = req.user;

  const continuousRevisionTopics = (await StudyData.find({
    user: user._id,
    tag: "continuous_revision",
    createdAt: { $gte: todayUTC },
  }).exec()) as IDataSchema[];

  const planner = await Planner.findOne({
    student: user._id,
    "days.date": todayUTC,
  });

  if (!planner) {
    throw new Error(
      `Planner not found for user ${user._id} and date ${yesterdayUTC}`,
    );
  }

  const { dailyContinuousTopics, dailyBackTopics } = getDailyTopics(
    continuousRevisionTopics,
    [],
    user,
  );

  dailyContinuousTopics.forEach((data) => {
    if (!data.topic.studiedAt) {
      data.topic.studiedAt = [];
    }
    data.topic.studiedAt.push({ date: todayUTC, efficiency: 0 });
  });

  const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];

  const dailyQuestions = await getDailyQuestions(
    moment(todayUTC).format("dddd"),
    todayUTC,
    dailyTopics,
  );

  await Planner.updateOne(
    { student: user._id, "days.date": todayUTC },
    {
      $set: {
        "days.$.continuousRevisionTopics": dailyContinuousTopics,
        "days.$.questions": dailyQuestions,
      },
    },
  );

  continuousRevisionTopics.forEach(
    (data) => (data.tag = "active_continuous_revision"),
  );
  await Promise.all(continuousRevisionTopics.map((data) => data.save()));

  res.status(200).json({
    success: true,
    message: `Updated planner for user ${user._id} for date ${todayUTC}`,
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
    const userId = req.user._id;

    const startDate = moment().startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();
    
    const planner = await Planner.findOne({
      student: userId,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    if (!planner) {
      return res.status(404).json({
        success: false,
        message: "Planner not exists for the current week",
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
