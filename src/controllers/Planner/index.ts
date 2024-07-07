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
  try {
    const timezone = "Asia/Kolkata";

    // Get today in IST
    const todayIST = moment().tz(timezone).startOf("day");
    const todayUTC = todayIST.clone().utc().toDate();

    // Get next day in IST
    const nextDayIST = todayIST.clone().add(1, "days").startOf("day");
    const nextDayUTC = nextDayIST.clone().utc().toDate();

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
        `Planner not found for user ${user._id} and date ${todayUTC}`,
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
      data.topic.studiedAt.push({ date: nextDayUTC, efficiency: 0 });

      if (!data.topic.plannerFrequency) {
        data.topic.plannerFrequency = 0;
      }
      data.topic.plannerFrequency += 1;
    });

    const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];

    const dailyQuestions = await getDailyQuestions(
      moment(nextDayUTC).format("dddd"),
      nextDayUTC,
      dailyTopics,
    );

    // Merge existing questions with new dailyQuestions
    const existingQuestions = planner.days.find(day => day.date.toISOString() === todayUTC.toISOString())?.questions || {};
    const mergedQuestions = { ...existingQuestions, ...dailyQuestions };

    const updatePlanner = await Planner.updateOne(
      { student: user._id, "days.date": todayUTC },
      {
        $push: {
          "days.$.continuousRevisionTopics": { $each: dailyContinuousTopics },
        },
        $set: {
          "days.$.questions": mergedQuestions,
        },
      },
    );

    await Promise.all(continuousRevisionTopics.map((data) => {
      data.tag = "active_continuous_revision";
      return data.save();
    }));

    console.log("planner updated");

    res.status(200).json({
      success: true,
      message: `Planner Updated`,
      planner: updatePlanner,
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
