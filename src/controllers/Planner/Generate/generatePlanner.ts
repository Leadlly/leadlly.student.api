import { Request, Response, NextFunction } from "express";
import moment from "moment-timezone";
import Planner from "../../../models/plannerModel";
import { StudyData } from "../../../models/studentData"; // Import the model
import { db } from "../../../db/db";
import IDataSchema, { Topic } from "../../../types/IDataSchema"; // Import the interface
import { getDailyTopics } from "../DailyTopics/getDailyTopics";
import IUser from "../../../types/IUser";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const timezone = "Asia/Kolkata";

export const generateWeeklyPlanner = async (user: IUser, backRevisionTopics: IDataSchema[]) => {
  const startDate = moment().tz(timezone).startOf("isoWeek").toDate();
  const endDate = moment().tz(timezone).endOf("isoWeek").toDate();

  const yesterday = moment().tz(timezone).subtract(1, 'days').startOf("day").toDate();

  const continuousRevisionTopics = (await StudyData.find({
    user: user._id,
    tag: "continuous_revision",
    createdAt: { $gte: yesterday },
  }).exec()) as IDataSchema[];

  // const backRevisionTopics = (await StudyData.find({
  //   user: studentId,
  //   tag: "unrevised_topic",
  // }).exec()) as IDataSchema[];

  const days = daysOfWeek.map((day, index) => {
    const date = moment(startDate).add(index, "days").tz(timezone).toDate();

    const dailyTopics = getDailyTopics(
      continuousRevisionTopics,
      backRevisionTopics,
      user
    );

    dailyTopics.forEach(data => {
      if (!data.topic.studiedAt) {
        data.topic.studiedAt = [];
      }
      data.topic.studiedAt.push({ date, efficiency: 0 }); // Add date with null efficiency for now
    });

    return { day, date, topics: dailyTopics };
  });

  const generatedPlanner = new Planner({
    student: user._id,
    startDate,
    endDate,
    days,
  });

  const planner = await Planner.create(generatedPlanner);
  continuousRevisionTopics.forEach(data => data.tag = "active_continuous_revision");
  await Promise.all(continuousRevisionTopics.map(data => data.save())); 

  console.log(planner);
  return planner;
};
