import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { Meeting } from "../../models/meetingModal";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import mongoose from "mongoose";
import { db } from "../../db/db";
import cron from 'node-cron';
import { sendMeetingNotification } from "./helper/sendMeetingNotification";


const getMeetingLimit = (subscriptionCategory: string): number => {
    switch (subscriptionCategory) {
      case 'free':
      case 'basic':
        return 0;
      case 'pro':
        return 1;
      case 'premium':
        return Infinity;
      default:
        return 0;
    }
  };
  
  export const requestMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, time, message } = req.body;
      const studentId = req.user._id;
      const student = await User.findById(studentId).populate('mentor') as IUser;
  
      if (!student) {
        throw new CustomError("Student not found", 404);
      }
  
      const mentorId = student.mentor._id;
      if (!mentorId) {
        return next(new CustomError("Mentor not allotted", 400));
      }
  
      const mentor = await db.collection("mentors").findOne({ _id: mentorId });
      if (!mentor) {
        return next(new CustomError("Mentor not exists", 400));
      }
  
      // Check subscription limit
      const subscriptionCategory = student.category!;
      const meetingLimit = getMeetingLimit(subscriptionCategory);
  
      // Calculate the start of the current week (assuming weeks start on Monday)
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1)));
      startOfWeek.setHours(0, 0, 0, 0);
  
      // Count meetings scheduled for this week
      const meetingsThisWeek = await Meeting.countDocuments({
        student: studentId,
        date: { $gte: startOfWeek },
        isCompleted: false
      });
  
      if (meetingsThisWeek >= meetingLimit) {
        return next(new CustomError(`You have reached your weekly meeting limit (${meetingLimit} for ${subscriptionCategory} subscription)`, 400));
      }
  
      const newMeeting = new Meeting({
        date,
        time,
        student: studentId,
        mentor: mentorId,
        message,
        "gmeet.link": mentor?.gmeet?.link,
        createdBy: 'student'
      });
  
      await newMeeting.save();

      const meetingDateTime = new Date(date); // Combine date and time
      const notificationTime = new Date(meetingDateTime.getTime() - 10 * 60000); // 10 minutes before
  
      try {
         // Schedule a cron job for sending notifications
    
      // Schedule the notification for 10 minutes before the meeting
      cron.schedule(notificationTime.toISOString(), async() => {
        await sendMeetingNotification(notificationTime, studentId, mentorId);
      });
      
      // Schedule the notification for the actual meeting time
      cron.schedule(meetingDateTime.toISOString(), async() => {
        await sendMeetingNotification(meetingDateTime, studentId, mentorId, 'today');
      });
      } catch (error) {
        console.log(error)
      }
  
      // Schedule the completion of meeting status
      cron.schedule(meetingDateTime.toISOString(), async() => {
        // Mark the meeting as completed
        await Meeting.updateOne({ _id: newMeeting._id }, { isCompleted: true });
      });
  
      res.status(201).json({ message: "Meeting requested successfully", meeting: newMeeting });
    } catch (error: any) {
      next(new CustomError(error.message, error.status || 500));
    }
  };

export const getMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user._id;
        const mentorId = req.user.mentor._id;

        const studentObjectId = new mongoose.Types.ObjectId(studentId);
        const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

        console.log(studentObjectId, mentorId, "hello")

        // Initialize a query object
        let query: any = {
            student: studentObjectId,
            mentor: mentorObjectId
        };

        if (req.query.meeting === 'done') {
            query.isCompleted = true;
        } else {
            query.isCompleted = false;
        }

        const meetings = await Meeting.find(query).sort({date: 1, time: -1});

        console.log(meetings, "here")
        res.status(200).json({
            success: true,
            meetings
        });

    } catch (error: any) {
        next(new CustomError(error.message, error.status || 500));
    }
};