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

export const generateWeeklyPlanner = async (
  user: IUser,
  backRevisionTopics: IDataSchema[],
) => {
  // Determine the activation date
  const activationDate =
    user.freeTrial?.dateOfActivation || user.subscription?.dateOfActivation;

  if (!activationDate) {
    throw new Error("Activation date not found");
  }

  const activationMoment = moment(activationDate);
  const currentMoment = moment();

  // Determine the start and end dates of the planner
  let startDate;
  let endDate;

  if (activationMoment.isSame(currentMoment, 'week')) {
    startDate = activationMoment.startOf("day").toDate();
    endDate = moment(startDate).endOf("isoWeek").toDate();
  } else {
    startDate = currentMoment.startOf("isoWeek").toDate();
    endDate = moment(startDate).endOf("isoWeek").toDate();
  }

  const existingPlanner = await Planner.findOne({
    student: user._id,
    startDate,
    endDate,
  });

  if (existingPlanner) {
    console.log("Planner already exists");
    return { message: "Planner already exists", planner: existingPlanner };
  }

  const yesterday = moment().subtract(1, "days").startOf("day").toDate();

  const continuousRevisionTopics = (await StudyData.find({
    user: user._id,
    tag: "continuous_revision",
    createdAt: { $gte: yesterday },
  }).exec()) as IDataSchema[];

  const startDayIndex = activationMoment.isSame(currentMoment, 'week')
    ? daysOfWeek.indexOf(activationMoment.format('dddd'))
    : 0;

  let dailyQuestions;
  const days = await Promise.all(
    daysOfWeek.slice(startDayIndex).map(async (day, index) => {
      const date = activationMoment.isSame(currentMoment, 'week')
        ? moment(activationMoment).add(index, "days").toDate()
        : moment(startDate).add(index, "days").toDate();

      if (day === "Sunday") {
        return {
          day,
          date,
          continuousRevisionTopics: [],
          backRevisionTopics: [],
          questions: [],
        };
      }

      const { dailyContinuousTopics, dailyBackTopics } = getDailyTopics(
        [],
        backRevisionTopics,
        user,
      );

      const dailyTopics = [...dailyContinuousTopics, ...dailyBackTopics];

      dailyTopics.forEach((data) => {
        if (!data.topic.studiedAt) {
          data.topic.studiedAt = [];
        }
        data.topic.studiedAt.push({ date, efficiency: 0 });
      });

      dailyQuestions = await getDailyQuestions(day, date, dailyTopics);
      return {
        day,
        date,
        continuousRevisionTopics: dailyContinuousTopics,
        backRevisionTopics: dailyBackTopics,
        questions: dailyQuestions,
      };
    }),
  );

  const generatedPlanner = new Planner({
    student: user._id,
    startDate,
    endDate,
    days,
  });

  const planner = await Planner.create(generatedPlanner);
  continuousRevisionTopics.forEach(
    (data) => (data.tag = "active_continuous_revision"),
  );

  backRevisionTopics.forEach((data) => {
    if (data.tag === "unrevised_topic") {
      data.tag = "active_back_revision";
    } else if (data.tag === "continuous_low_efficiency") {
      data.tag = "active_continuous_low_efficiency";
    }
  });
  await Promise.all(continuousRevisionTopics.map((data) => data.save()));

  return { message: "Planner created", planner };
};
