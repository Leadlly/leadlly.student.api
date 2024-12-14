import mongoose, { ObjectId } from "mongoose";
import { Push_Token } from "../../../models/push_token";
import { error } from "console";
import { sendPushNotification } from "../../../utils/sendPushNotification";
import IUser from "../../../types/IUser";
import { sendMail } from "../../../utils/sendMail";
import { db } from "../../../db/db";

export const sendMeetingNotification = async (
  meetingTime: Date,
  studentId: ObjectId,
  mentorId: ObjectId,
  today?: string
) => {
  try {
    const pushToken = await Push_Token.findOne({
      user: studentId.toString(),
    }).populate("user");
    if (!pushToken) throw error("Token not exists");
    
    const mentor = await db.collection('mentors').findOne({
        _id: new mongoose.Types.ObjectId(mentorId.toString())
    });

    const message = {
      heading: "📢 Meeting Reminder!",
      message: `Hi ${(pushToken.user as IUser).firstname}, ${
        today
          ? `Your meeting is today at ${meetingTime.toLocaleTimeString()}`
          : "Your meeting will start in 10 minutes"
      }`,
      action: "Check here",
      url: "leadlly-student-app://meetings",
    };

    await sendPushNotification(
      [pushToken.push_token],
      message.heading,
      message.message,
      message.action,
      message.url
    );

    await sendMail({
        email: (pushToken.user as IUser).email,
        subject: message.heading,
        message: message.message
    });
  } catch (error: any) {
    return error.message;
  }
};
