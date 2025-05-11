import Planner from "../../../models/plannerModel";
import IUser from "../../../types/IUser";
import { getDailyQuestions } from "../DailyQuestions/getDailyQuestions";
import moment from "moment-timezone";
import { getDailyTopics } from "../DailyTopics/getDailyTopics";
import IDataSchema, { ISubtopicsData } from "../../../types/IDataSchema";
import { StudyData } from "../../../models/studentData";
import mongoose from "mongoose";
import { SubtopicsData } from "../../../models/subtopics_data";

export const updateDailyPlannerLogic = async (user: IUser, mentor?: boolean) => { //mentor variable is to check wheather mentor update planner or not
  
    const timezone = "Asia/Kolkata";
    const today = moment().tz(timezone).startOf("day");
    const nextDay = moment(today).add(1, "days").startOf("day");
  
    // If mentor is updating the planner, always use today as the target day
    // Otherwise, use the user's preference
    const targetDay = mentor ? today : (user.preferences?.continuousData?.nextDay ? nextDay : today);
    const formattedTargetDay = targetDay.format("DD-MM-YYYY");
  
    let continuousRevisionTopics = await StudyData.find({
      user: new mongoose.Types.ObjectId(user._id),
      tag: "continuous_revision",
      $or: [
        { createdAt: { $gte: today.toDate() } },
        { updatedAt: { $gte: today.toDate() } }
      ]
    }).exec() as IDataSchema[];
  
    const continuousRevisionSubTopics = await SubtopicsData.find({
      user: new mongoose.Types.ObjectId(user._id),
      tag: "continuous_revision",
      createdAt: { $gte: today.toDate() },
    }).exec() as ISubtopicsData[];
  
    // Filter out topics with corresponding subtopics
    if (continuousRevisionSubTopics.length > 0) {
      const topicsWithSubtopics = new Set(
        continuousRevisionSubTopics.map(subtopic => subtopic.topic.id.toString())
      );
  
      continuousRevisionTopics = continuousRevisionTopics.filter(
        data => !topicsWithSubtopics.has(data.topic.id.toString())
      );
    }
  
    const startDate = moment().startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();
  
    const planner = await Planner.findOne({
      student: new mongoose.Types.ObjectId(user._id),
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });
  
    if (!planner) {
      return {
        success: false,
        message: `Planner not found for user ${user._id} for the date ${formattedTargetDay}`,
      };
    }
  
    const { dailyContinuousTopics, dailyContinuousSubtopics, dailyBackTopics } = getDailyTopics(
      continuousRevisionTopics,
      [],
      user,
      continuousRevisionSubTopics
    );
  
    const targetDayString = targetDay.format("YYYY-MM-DD");
  
    const existingDay = planner.days.find(day => 
      moment(day.date).format("YYYY-MM-DD") === targetDayString
    );
  
    if (!existingDay) {
      return {
        success: false,
        message: "Target day not found in current week planner.",
      };
    }
  
    const existingContinuousTopics = new Set(
      existingDay.continuousRevisionTopics?.map(data => data.topic.name.toLowerCase()) || []
    );
  
    const existingContinuousSubTopics = new Set(
      existingDay.continuousRevisionSubTopics?.map(data => data.subtopic.name.toLowerCase()) || []
    );
  
    const existingBackTopics = new Set(
      existingDay.backRevisionTopics?.map(data => data.topic.name.toLowerCase()) || []
    );
  
    const duplicateTopics = dailyContinuousTopics.filter(
      data => existingContinuousTopics.has(data.topic.name.toLowerCase()) ||
              existingBackTopics.has(data.topic.name.toLowerCase())
    ).map(data => data.topic.name);
  
    const duplicateSubtopics = dailyContinuousSubtopics.filter(
      (data: any) => existingContinuousSubTopics.has(data.subtopic.name.toLowerCase())
    ).map((data: any) => data.subtopic.name);
  
    const newContinuousTopics = dailyContinuousTopics.filter(
      data => 
        !existingContinuousTopics.has(data.topic.name.toLowerCase()) &&
        !existingBackTopics.has(data.topic.name.toLowerCase())
    );
  
    const newContinuousSubTopics = dailyContinuousSubtopics.filter(
      (data: any) => 
        !existingContinuousSubTopics.has(data.subtopic.name.toLowerCase())
    );
  
    if (
      newContinuousTopics.length === 0 &&
      newContinuousSubTopics.length === 0
    ) {
      return {
        success: false,
        message: `Selected Topic/Subtopic already present for ${formattedTargetDay}`,
        duplicates: {
          topics: duplicateTopics,
          subtopics: duplicateSubtopics,
        }
      };
    }
  
    newContinuousTopics.forEach((data) => {
      data.topic.studiedAt = data.topic.studiedAt || [];
      data.topic.studiedAt.push({ date: targetDay.toDate(), efficiency: 0 });
  
      data.topic.plannerFrequency = (data.topic.plannerFrequency || 0) + 1;
    });
  
    newContinuousSubTopics.forEach((data: any) => {
      data.subtopic.studiedAt = data.subtopic.studiedAt || [];
      data.subtopic.studiedAt.push({ date: targetDay.toDate(), efficiency: 0 });
  
      data.subtopic.plannerFrequency = (data.subtopic.plannerFrequency || 0) + 1;
    });
  
    const dailyTopics = [...newContinuousTopics, ...dailyBackTopics];
  
    const dailyQuestions = await getDailyQuestions(
      moment(targetDay).format("dddd"),
      targetDay.toDate(),
      dailyTopics,
      user,
      newContinuousSubTopics
    );
  
    const existingQuestions = existingDay.questions || {};
    const mergedQuestions = { ...existingQuestions, ...dailyQuestions };
  
    const updatePlanner = await Planner.updateOne(
      { student: user._id, "days.date": targetDay.toDate() },
      {
        $push: {
          "days.$.continuousRevisionTopics": { $each: newContinuousTopics },
          "days.$.continuousRevisionSubTopics": { $each: newContinuousSubTopics },
        },
        $set: {
          "days.$.questions": mergedQuestions,
        },
      }
    );
  
    if (updatePlanner.matchedCount === 0) {
      return {
        success: false,
        message: "Failed to update the planner.",
      };
    }
  
    await StudyData.updateMany(
      { _id: { $in: continuousRevisionTopics.map(data => data._id) } },
      { $set: { tag: "active_continuous_revision" } }
    );
  
    await SubtopicsData.updateMany(
      { _id: { $in: continuousRevisionSubTopics.map(data => data._id) } },
      { $set: { tag: "active_continuous_revision" } }
    );
  
    return {
      success: true,
      message: `Planner Updated for ${targetDay.toDate()}`,
      planner: updatePlanner,
      duplicates: {
        topics: duplicateTopics,
        subtopics: duplicateSubtopics,
      }
    };
  };