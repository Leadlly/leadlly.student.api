import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { Meeting } from "../../models/meetingModal";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import mongoose from "mongoose";
import { db } from "../../db/db";

export const requestMeeting = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date, time, message } = req.body;
        
        const studentId = req.user._id;
        
        const student = await User.findById(studentId).populate('mentor') as IUser;
        if (!student) {
            throw new CustomError("Student not found", 404);
        }

        const mentorId = student.mentor.id;
        if (!mentorId) {
            return next(new CustomError("Mentor not allotted", 400))
        }

        const mentor = await db.collection("mentors").findOne({_id: mentorId})
        if(!mentor) return next(new CustomError("Mentor not exists", 400))

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

        res.status(201).json({
            message: "Meeting requested successfully",
            meeting: newMeeting
        });

    } catch (error: any) {
        next(new CustomError(error.message, error.status || 500));
    }
};

export const getMeetings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const studentId = req.user._id;
        const mentorId = req.user.mentor.id;

        const studentObjectId = new mongoose.Types.ObjectId(studentId);
        const mentorObjectId = new mongoose.Types.ObjectId(mentorId);

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

        const meetings = await Meeting.find(query);

        res.status(200).json({
            success: true,
            meetings
        });

    } catch (error: any) {
        next(new CustomError(error.message, error.status || 500));
    }
};