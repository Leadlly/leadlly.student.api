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
import mongoose from "mongoose";

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

    const result = await generateWeeklyPlanner(user, backRevisionTopics, req.body.nextWeek);

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
    const today = moment().tz(timezone).startOf("day");
    const nextDay = moment(today).add(1, "days").startOf("day");

    const user: IUser = req.user;

    const continuousRevisionTopics = await StudyData.find({
      user: new mongoose.Types.ObjectId(user._id),
      tag: "continuous_revision",
      createdAt: { $gte: today.toDate() },
    }).exec() as IDataSchema[];

    const startDate = moment().startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();

    const planner = await Planner.findOne({
      student: new mongoose.Types.ObjectId(user._id),
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    if (!planner) {
      throw new Error(
        `Planner not found for user ${user._id} for the date ${nextDay}`,
      );
    }

    const { dailyContinuousTopics, dailyBackTopics } = getDailyTopics(
      continuousRevisionTopics,
      [],
      user,
    );

    const nextDayString = nextDay.format("YYYY-MM-DD");

    const existingDay = planner.days.find(day => 
      moment(day.date).format("YYYY-MM-DD") === nextDayString
    );

    const existingContinuousTopics = new Set(
      existingDay?.continuousRevisionTopics
        .map(data => data.topic.name.toLowerCase()) || []
    );

    const existingBackTopics = new Set(
      existingDay?.backRevisionTopics
        .map(data => data.topic.name.toLowerCase()) || []
    );

    // Filter out topics that are already present for the day
    const newContinuousTopics = dailyContinuousTopics.filter(
      data => !existingContinuousTopics.has(data.topic.name.toLowerCase()) &&
              !existingBackTopics.has(data.topic.name.toLowerCase())
    );

    if (newContinuousTopics.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Topics are already added for the next day.",
      });
    }

    newContinuousTopics.forEach((data) => {
      if (!data.topic.studiedAt) {
        data.topic.studiedAt = [];
      }
      data.topic.studiedAt.push({ date: nextDay.toDate(), efficiency: 0 });

      if (!data.topic.plannerFrequency) {
        data.topic.plannerFrequency = 0;
      }
      data.topic.plannerFrequency += 1;
    });

    const dailyTopics = [...newContinuousTopics, ...dailyBackTopics];

    const dailyQuestions = await getDailyQuestions(
      moment(nextDay).format("dddd"),
      nextDay.toDate(),
      dailyTopics,
      user
    );

    console.log(dailyQuestions, "here are the questions")

    const existingQuestions = existingDay?.questions || {};
    const mergedQuestions = { ...existingQuestions, ...dailyQuestions };

    const updatePlanner = await Planner.updateOne(
      { student: user._id, "days.date": nextDay.toDate() },
      {
        $push: {
          "days.$.continuousRevisionTopics": { $each: newContinuousTopics },
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
      message: `Planner Updated for ${nextDay.toDate()}`,
      planner: updatePlanner,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const allocateBackTopicsToExistingPlanner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const timezone = "Asia/Kolkata";
    const startDate = moment().tz(timezone).startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();

    const user = req.user;

    // Fetch the planner
    const planner = await Planner.findOne({
      student: new mongoose.Types.ObjectId(user._id),
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    if (!planner) {
      return next(new CustomError("Planner does not exist for the current week"));
    }

    const allUnrevisedTopics = (await StudyData.find({
      user: user._id,
      tag: "unrevised_topic",
    }).exec()) as IDataSchema[];

    // Map through days and update where necessary
    const updatedDays = await Promise.all(planner.days.map(async (day) => {
      if (day.day === "Sunday") {
        return day;  // Skip Sundays
      }

      if (day.backRevisionTopics.length === 0) {
        const { dailyContinuousTopics, dailyBackTopics } = getDailyTopics(
          [],
          allUnrevisedTopics,
          user,
        );

        const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];

        await Promise.all(dailyTopics.map(async (data) => {
          const studyData = await StudyData.findOne({
            user: user._id,
            "topic.name": data.topic.name
          }).exec() as IDataSchema;

          if (studyData) {
            if (!studyData.topic.studiedAt) {
              studyData.topic.studiedAt = [];
            }
            studyData.topic.studiedAt.push({ date: day.date, efficiency: 0 });

            if (!studyData.topic.plannerFrequency) {
              studyData.topic.plannerFrequency = 0;
            }
            studyData.topic.plannerFrequency += 1;

            if (studyData.tag === "unrevised_topic") {
              studyData.tag = "active_unrevised_topic";
            }

            await studyData.save();
          }
        }));

        const dailyQuestions = await getDailyQuestions(
          moment(day.date).format("dddd"),
          day.date,
          dailyBackTopics,
          user
        );

        // Create a clean day object
        return {
          date: day.date,
          day: day.day,
          continuousRevisionTopics: day.continuousRevisionTopics,
          backRevisionTopics: dailyBackTopics,
          completedTopics: day.completedTopics,
          incompletedTopics: day.incompletedTopics,
          questions: { ...day.questions, ...dailyQuestions },
        };
      }

      return day;
    }));

    console.log('Updated Days:', updatedDays);

    // Update the planner with allocated back topics and questions
    const updatePlanner = await Planner.updateOne(
      { 
        student: new mongoose.Types.ObjectId(user._id),
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      },
      { $set: { days: updatedDays } }
    );

    console.log('Update Planner Result:', updatePlanner);

    res.status(200).json({
      success: true,
      message: "Back topics allocated successfully.",
      planner: updatePlanner,
    });
  } catch (error) {
    console.error('Error in allocateBackTopicsToExistingPlanner:', error);
    next(new CustomError((error as Error).message));
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

    // Extract startDate and endDate from the request body
    const { startDate: requestStartDate, endDate: requestEndDate } = req.body;

    let startDate, endDate;

    if (requestStartDate && requestEndDate) {
      // Convert provided startDate and endDate to IST
      startDate = moment(requestStartDate).tz("Asia/Kolkata").startOf("day").toDate();
      endDate = moment(requestEndDate).tz("Asia/Kolkata").endOf("day").toDate();
    } else {
      // Default to current week
      startDate = moment().startOf("isoWeek").toDate();
      endDate = moment(startDate).endOf("isoWeek").toDate();
    }

    const planner = await Planner.findOne({
      student: userId,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    if (!planner) {
      return res.status(404).json({
        success: false,
        message: "Planner not exists for the specified period",
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