import moment from "moment-timezone";
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
  nextWeek: boolean
) => {
  const activationDate =
    user.freeTrial?.dateOfActivation || user.subscription?.dateOfActivation;

  if (!activationDate) {
    throw new Error("Activation date not found");
  }

  const timezone = "Asia/Kolkata";
  const activationMoment = moment.tz(activationDate, timezone);
  const currentMoment = moment.tz(timezone);
  const nextDay = activationMoment.add(0, 'days').startOf('day');

  let startDate;
  let endDate;

  if (nextWeek) {
    // Set the planner for the next week
    startDate = currentMoment.add(1, "week").startOf("isoWeek").toDate();
    endDate = moment(startDate).endOf("isoWeek").toDate();
  } else {
    // Set the planner for the current week or next day based on activation date

    if (nextDay.isSame(currentMoment, 'week')) {
      startDate = nextDay.toDate();
      endDate = moment(startDate).endOf("isoWeek").toDate();
    } else {
      startDate = currentMoment.startOf("isoWeek").toDate();
      endDate = moment(startDate).endOf("isoWeek").toDate();
    }
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

  const yesterday = moment.tz(timezone).subtract(1, "days").startOf("day").toDate();

  const continuousRevisionTopics = (await StudyData.find({
    user: user._id,
    tag: "continuous_revision",
    createdAt: { $gte: yesterday },
  }).exec()) as IDataSchema[];

  const startDayIndex = nextWeek
    ? 0
    : (activationMoment.startOf("week").isSame(currentMoment, 'week')
        ? daysOfWeek.indexOf(nextDay.format('dddd'))
        : 0);

  let dailyQuestions;
  const days = await Promise.all(
    daysOfWeek.slice(startDayIndex).map(async (day, index) => {
      const date = nextWeek
        ? moment(startDate).add(index, "days").toDate()
        : (nextDay.isSame(currentMoment, 'week')
            ? moment(nextDay).add(index, "days").toDate()
            : moment(startDate).add(index, "days").toDate());

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

      // Fetch and update topics in the StudyData collection
      await Promise.all(dailyTopics.map(async (data) => {
        const studyData = await StudyData.findOne({
          user: user._id,
          "topic.name": data.topic.name
        }).exec() as IDataSchema;

        if (studyData) {
          if (!studyData.topic.studiedAt) {
            studyData.topic.studiedAt = [];
          }
          studyData.topic.studiedAt.push({ date, efficiency: 0 });

          if (!studyData.topic.plannerFrequency) {
            studyData.topic.plannerFrequency = 0;
          }
          studyData.topic.plannerFrequency += 1;

          if (studyData.tag === "unrevised_topic") {
            studyData.tag = "active_unrevised_topic";
          }

          await studyData.save();
        }
      }));

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
  await Promise.all(continuousRevisionTopics.map((data) => data.save()));

  return { message: "Planner created", planner };
};
