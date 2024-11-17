import moment from "moment-timezone";
import Planner from "../../../models/plannerModel";
import { StudyData } from "../../../models/studentData";
import IDataSchema from "../../../types/IDataSchema";
import { getDailyTopics } from "../DailyTopics/getDailyTopics";
import IUser from "../../../types/IUser";
import { getDailyQuestions } from "../DailyQuestions/getDailyQuestions";
import { PlannerChapter } from "../../../types/IPlanner";

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
  nextWeek: boolean,
  chapters?: PlannerChapter[]
) => {
  const activationDate =
    user.freeTrial?.dateOfActivation || user.subscription?.dateOfActivation;

  if (!activationDate) {
    throw new Error("Activation date not found");
  }

  const timezone = "Asia/Kolkata";
  const activationMoment = moment.tz(activationDate, timezone);
  const currentMoment = moment.tz(timezone);

  if (nextWeek) {
    console.log("Generating planner for next week");

    // Calculate the start and end of next week
    const startDateLocal = moment(currentMoment).startOf('isoWeek').add(1, 'week').startOf('day');
    const endDateLocal = moment(startDateLocal).endOf('isoWeek').endOf('day');

    const startDate = startDateLocal.toDate();
    const endDate = endDateLocal.toDate();

    console.log(startDate, endDate, "here are the date");

    const existingPlanner = await Planner.findOne({
      student: user._id,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
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

    const startDayIndex = daysOfWeek.indexOf(moment(startDate).format('dddd'));

    console.log("Start day index:", startDayIndex);

    let dailyQuestions;
    const days = await Promise.all(
      daysOfWeek.map(async (day, index) => {
        const date = moment(startDate).add(index, "days").toDate();

        console.log(`Processing ${day}: ${date}`);

        if (day === "Sunday") {
          return {
            day,
            date,
            continuousRevisionTopics: [],
            backRevisionTopics: [],
            questions: [],
          };
        }

        const { dailyContinuousTopics, dailyBackTopics, dailyBackChapters } = getDailyTopics(
          [],
          backRevisionTopics,
          user,
          chapters,
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

        dailyQuestions = await getDailyQuestions(day, date, dailyTopics, user);
        return {
          day,
          date,
          continuousRevisionTopics: dailyContinuousTopics,
          backRevisionTopics: dailyBackTopics,
          chapters: dailyBackChapters,
          questions: dailyQuestions,
        };
      }),
    );

    console.log("Days generated for next week:", days);

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

  } else {
    console.log("Generating planner for current week");

    let startDateLocal, endDateLocal;
    
    // Start from the next day of activation date
    const nextDay = activationMoment.add(0, 'days').startOf('day'); //temporary putted current day(0)

    if (nextDay.isSame(currentMoment, 'week')) {
      startDateLocal = nextDay;
      endDateLocal = moment(startDateLocal).endOf("isoWeek").endOf('day');
    } else {
      startDateLocal = moment(nextDay).startOf('isoWeek').add(1, 'weeks');
      endDateLocal = moment(startDateLocal).endOf('isoWeek').endOf('day');
    }

    const startDate = startDateLocal.toDate();
    const endDate = endDateLocal.toDate();

    const existingPlanner = await Planner.findOne({
      student: user._id,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
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

    const startDayIndex = nextDay.isSame(currentMoment, 'week')
    ? daysOfWeek.indexOf(nextDay.format('dddd'))
    : 0;

    let dailyQuestions;
    const days = await Promise.all(
     daysOfWeek.slice(startDayIndex).map(async (day, index) => {
      const date = nextDay.isSame(currentMoment, 'week')
        ? moment(nextDay).add(index, "days").toDate()
        : moment(startDate).add(index, "days").toDate();

        console.log(`Processing ${day}: ${date}`);

        const isFirstWeekAfterActivation = nextDay.isSame(user.freeTrial.dateOfActivation, 'week');
        console.log(isFirstWeekAfterActivation, 'first week')

        if (day === "Sunday" && !isFirstWeekAfterActivation) {
          return {
            day,
            date,
            continuousRevisionTopics: [],
            backRevisionTopics: [],
            questions: [],
          };
        }

        const { dailyContinuousTopics, dailyBackTopics, dailyBackChapters } = getDailyTopics(
          [],
          backRevisionTopics,
          user,
          chapters,
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
            } else if (studyData.tag === "active_unrevised_topic") {
              studyData.tag = "inflow_unrevised_topic"
            } else if ( studyData.tag === "active_continuous_revision") {
              studyData.tag = "inflow_continuous_revision"
            }

            await studyData.save();
          }
        }));

        dailyQuestions = await getDailyQuestions(day, date, dailyTopics, user);
        return {
          day,
          date,
          continuousRevisionTopics: dailyContinuousTopics,
          backRevisionTopics: dailyBackTopics,
          chapters: dailyBackChapters,
          questions: dailyQuestions,
        };
      }),
    );

    console.log("Days generated for current week:", days);

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
  }
};
