import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import Planner from '../../../models/plannerModel';
import { StudyData } from '../../../models/studentData'; // Import the model
import { db } from '../../../db/db';
import IDataSchema from '../../../types/IDataSchema'; // Import the interface
import { getDailyTopics } from '../DailyTopics/getDailyTopics';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timezone = 'Asia/Kolkata';

export const generateWeeklyPlanner = async (studentId: string) => {
  const startDate = moment().tz(timezone).startOf('isoWeek').toDate();
  const endDate = moment().tz(timezone).endOf('isoWeek').toDate();

  const today = moment().tz(timezone).startOf('day').toDate();

  // Fetch continuous revision and back revision topics
  const continuousRevisionTopics = await StudyData.find({
    user: studentId,
    tag: 'continuous_revision',
    createdAt: { $gte: today},
  }).exec() as IDataSchema[];

  const backRevisionTopics = await StudyData.find({
    user: studentId,
    tag: 'unrevised_topic',
  }).exec() as IDataSchema[];

  // Generate daily topics
  const days = daysOfWeek.map((day, index) => {
    const date = moment(startDate).add(index, 'days').tz(timezone).toDate();

    // Get topics for the day
    const dailyTopics = getDailyTopics(continuousRevisionTopics, backRevisionTopics);
    console.log("dailtpoc", dailyTopics)

    // Resetting the tag for continuousRevisionTopics tag
    // continuousRevisionTopics.forEach(topic => topic.tag = "");

    return { day, date, topics: dailyTopics };
  });

  const generatedPlanner = new Planner({
    student: studentId,
    startDate,
    endDate,
    days,
  });

  const planner = await Planner.create(generatedPlanner)
  console.log(planner);
  return planner;
};
