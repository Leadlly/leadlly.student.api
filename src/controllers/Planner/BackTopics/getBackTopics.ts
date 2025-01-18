import moment from "moment-timezone";
import { StudyData } from "../../../models/studentData";
import IDataSchema from "../../../types/IDataSchema";
import User from "../../../models/userModel";
import IUser, { ISubject } from "../../../types/IUser";
import { getBackChapters } from "./getBackChapters";
import { PlannerChapter } from "../../../types/IPlanner";

const getWeekNumber = (startDate: Date, currentDate: Date) => {
  const start = moment.tz(startDate, "Asia/Kolkata");
  const current = moment.tz(currentDate, "Asia/Kolkata");
 
  // Calculate the difference in weeks
  return current.diff(start, "weeks") + 1;
};

export const getBackRevisionTopics = async (
  studentId: string,
  dateOfSubscription: Date,
) => {
  console.log("inside back revision");

  // Fetch the user to get the subjects
  const user = await User.findById(studentId).exec() as IUser;
  if (!user || !user.academic || !user.academic.subjects) {
    throw new Error("User or user subjects not found");
  }

  const subjects = user.academic.subjects;

  // Fetch all relevant topics in one go
  const activeContinuousRevisionTopics = (await StudyData.find({
    user: studentId,
    tag: "active_continuous_revision",
  }).exec()) as IDataSchema[];

  const allUnrevisedTopics = (await StudyData.find({
    user: studentId,
    tag: "unrevised_topic",
  }).exec()) as IDataSchema[];

  const activeUnrevisedTopics = (await StudyData.find({
    user: studentId,
    tag: "active_unrevised_topic",
  }).exec()) as IDataSchema[];


  let chapters: PlannerChapter[] = [];
  try {
    chapters = await getBackChapters(user);
  } catch (error) {
    console.error("Failed to get back chapters:", error);
  }

  const continuousLowEfficiency = activeContinuousRevisionTopics.filter(
    (data) => data.topic.overall_efficiency! < 40,
  );
  const unrevisedLowEfficiency = activeUnrevisedTopics.filter(
    (data) => data.topic.overall_efficiency! < 40,
  );

  console.log("1");
  const continuousModerateEfficiency = activeContinuousRevisionTopics.filter(
    (data) =>
      data.topic.overall_efficiency! >= 40 &&
      data.topic.overall_efficiency! < 60,
  );

  const currentWeek = getWeekNumber(dateOfSubscription, new Date());

  let backRevisionTopics: IDataSchema[] = [];

  if (currentWeek === 1 || currentWeek === 2) {
    // Week 1 and Week 2: backRevisionTopics contains only unrevised topics
    backRevisionTopics = allUnrevisedTopics;
    console.log("3 week1 2");
  } else {
    // For Week 3 onwards:

    // Determine the reference week to fetch topics from
    const referenceWeek = currentWeek - 2; 

    const getLastStudiedDate = (studiedAt: {   date?: Date; efficiency?: number; }[]) => {
      return studiedAt.length > 0 ? studiedAt[studiedAt.length - 1].date : null;
    };

    // Filter topics based on the reference week using the last studied date
    const filteredContinuousLowEfficiency = continuousLowEfficiency.filter(
      (data) => getWeekNumber(getLastStudiedDate(data.topic.studiedAt)!, new Date()) === referenceWeek,
    );
    const filteredUnrevisedLowEfficiency = unrevisedLowEfficiency.filter(
      (data) => getWeekNumber(getLastStudiedDate(data.topic.studiedAt)!, new Date()) === referenceWeek,
    );
    const filteredUnrevisedTopics = allUnrevisedTopics.filter(
      (data) => getWeekNumber(getLastStudiedDate(data.topic.studiedAt)!, new Date()) === referenceWeek,
    );
    console.log("4 week2");
    // Construct the backRevisionTopics array in the specified order
    backRevisionTopics = [
      ...filteredUnrevisedTopics,
      ...filteredContinuousLowEfficiency,
      ...filteredUnrevisedLowEfficiency,
      ...continuousModerateEfficiency
    ];
  }

  // Limit to 18 topics and mix equally from all subjects
  const subjectTopicsMap: Record<string, IDataSchema[]> = {};

  subjects.forEach((subject: ISubject) => {
    subjectTopicsMap[subject.name] = backRevisionTopics.filter(
      (topic) => topic.subject.name === subject.name,
    );
  });

  const maxTopicsPerSubject = Math.floor(18 / subjects.length);
  const mixedTopics: IDataSchema[] = [];

  subjects.forEach((subject: ISubject) => {
    const topics = subjectTopicsMap[subject.name].slice(0, maxTopicsPerSubject);
    mixedTopics.push(...topics);
  });

  const slicedTopics: number = user?.preferences?.backRevisionTopics * 6 || 60

  return {backRevisionTopics: mixedTopics.slice(0, slicedTopics), chapters};
};
