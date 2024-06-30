import moment from "moment";
import Planner from "../../../models/plannerModel";
import { StudyData } from "../../../models/studentData"; 
import IDataSchema, { Topic } from "../../../types/IDataSchema"; 
import { getDailyTopics } from "../DailyTopics/getDailyTopics";
import IUser from "../../../types/IUser";
import { getDailyQuestions } from "../DailyQuestions/getDailyQuestions";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const generateWeeklyPlanner = async (user: IUser, backRevisionTopics: IDataSchema[]) => {
  const today = moment().startOf("day").toDate();
  const activationDate = moment(user.subscription.dateOfActivation).startOf("day");
  
  // Determine the start date of the planner
  const startDate = activationDate.isSameOrAfter(moment().startOf("isoWeek")) 
    ? activationDate.toDate()
    : moment().startOf("isoWeek").toDate();

  const endDate = moment(startDate).endOf("isoWeek").toDate();

  const existingPlanner = await Planner.findOne({
    student: user._id,
    startDate,
    endDate
  });

  if (existingPlanner) {
    console.log("Planner already exists")
    return {message: "Planner already exists", planner: existingPlanner};
  }

  const yesterday = moment().subtract(1, 'days').startOf("day").toDate();

  const continuousRevisionTopics = (await StudyData.find({
    user: user._id,
    tag: "continuous_revision",
    createdAt: { $gte: yesterday },
  }).exec()) as IDataSchema[];

  let dailyQuestions;
  const days = await Promise.all(daysOfWeek.map(async (day, index) => {
    const date = moment(startDate).add(index, "days").toDate();

    const { dailyContinuousTopics, dailyBackTopics } = getDailyTopics(
      [],
      backRevisionTopics,
      user
    );

    const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];

    dailyTopics.forEach(data => {
      if (!data.topic.studiedAt) {
        data.topic.studiedAt = [];
      }
      data.topic.studiedAt.push({ date, efficiency: 0 }); // Add date with null efficiency for now
    });

    dailyQuestions = await getDailyQuestions(day, date, dailyTopics);
    return {
      day,
      date,
      continuousRevisionTopics: dailyContinuousTopics,
      backRevisionTopics: dailyBackTopics,
      questions: dailyQuestions
    };
  }));

  const generatedPlanner = new Planner({
    student: user._id,
    startDate,
    endDate,
    days,
  });

  const planner = await Planner.create(generatedPlanner);
  continuousRevisionTopics.forEach(data => data.tag = "active_continuous_revision");
  await Promise.all(continuousRevisionTopics.map(data => data.save())); 

  return {message: "Planner created", planner};
};
