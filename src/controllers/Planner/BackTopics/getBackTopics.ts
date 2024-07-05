import moment from "moment";
import { StudyData } from "../../../models/studentData";
import IDataSchema from "../../../types/IDataSchema";
import User from "../../../models/userModel";
import IUser from "../../../types/IUser";

const getWeekNumber = (startDate: Date, currentDate: Date) => {
  const start = moment(startDate);
  const current = moment(currentDate);
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

  const subjects = user.academic.subjects; // Assuming subjects is an array of subject names

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
    const referenceWeek = currentWeek - 2; // Fetch topics from one week before previous week

    // Filter topics based on the reference week
    const filteredContinuousLowEfficiency = continuousLowEfficiency.filter(
      (data) => getWeekNumber(data.updatedAt!, new Date()) === referenceWeek,
    );
    const filteredUnrevisedLowEfficiency = unrevisedLowEfficiency.filter(
      (data) => getWeekNumber(data.updatedAt!, new Date()) === referenceWeek,
    );
    const filteredUnrevisedTopics = allUnrevisedTopics.filter(
      (data) => getWeekNumber(data.updatedAt!, new Date()) === referenceWeek,
    );
    console.log("4 week2");
    // Construct the backRevisionTopics array in the specified order
    backRevisionTopics = [
      ...filteredContinuousLowEfficiency,
      ...filteredUnrevisedLowEfficiency,
      ...filteredUnrevisedTopics,
      ...continuousModerateEfficiency,
    ];
  }

  // Limit to 18 topics and mix equally from all subjects
  const subjectTopicsMap: Record<string, IDataSchema[]> = {};

  subjects.forEach((subject: any) => {
    subjectTopicsMap[subject] = backRevisionTopics.filter(
      topic => topic.subject === subject
    );
  });

  const maxTopicsPerSubject = Math.floor(18 / subjects.length);
  const mixedTopics: IDataSchema[] = [];

  subjects.forEach((subject: any) => {
    const topics = subjectTopicsMap[subject].slice(0, maxTopicsPerSubject);
    mixedTopics.push(...topics);
  });

  return mixedTopics.slice(0, 18); // Ensure the result is exactly 18 topics
};
