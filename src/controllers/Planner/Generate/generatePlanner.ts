import { Request, Response, NextFunction } from 'express';
import moment from 'moment-timezone';
import Planner from '../../../models/plannerModel'; 
import IPlanner from '../../../types/IPlanner';
import { db } from '../../../db/db';


const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timezone = 'Asia/Kolkata';
export const generateWeeklyPlanner = async (studentId: string) => {
    const startDate = moment().tz(timezone).startOf('isoWeek').toDate();
    const endDate = moment().tz(timezone).endOf('isoWeek').toDate();

    const yesterday = moment().tz(timezone).subtract(1, 'day').startOf('day').toDate();

  
    // Fetch continuous revision and back revision topics
    const continuousRevisionTopics = await db.collection('topics').find({ student: studentId, tag: 'continuous_revision', createdAt: { $gte: yesterday, $lt: startDate } }).toArray();
    const backRevisionTopics = await db.collection('topics').find({ student: studentId, tag: 'back_revision' }).toArray();
  
    // Generate daily topics
    const days = daysOfWeek.map((day, index) => {
      const date = moment(startDate).add(index, 'days').tz(timezone).toDate();
  
      // Get topics for the day
      const dailyTopics = getDailyTopics(continuousRevisionTopics, backRevisionTopics);

      // Reseting the tag for continuousRevisionTopics tag
      // continuousRevisionTopics.tag = ""
  
      return { day, date, topics: dailyTopics };
    });
  
    const planner = new Planner({
      student: studentId,
      startDate,
      endDate,
      days
    });


    return planner
    
  };
  