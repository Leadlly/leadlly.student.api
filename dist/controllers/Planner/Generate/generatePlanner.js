"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyPlanner = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const plannerModel_1 = __importDefault(require("../../../models/plannerModel"));
const studentData_1 = require("../../../models/studentData"); // Import the model
const getDailyTopics_1 = require("../DailyTopics/getDailyTopics");
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const timezone = "Asia/Kolkata";
const generateWeeklyPlanner = async (studentId) => {
  const startDate = (0, moment_timezone_1.default)()
    .tz(timezone)
    .startOf("isoWeek")
    .toDate();
  const endDate = (0, moment_timezone_1.default)()
    .tz(timezone)
    .endOf("isoWeek")
    .toDate();
  const today = (0, moment_timezone_1.default)()
    .tz(timezone)
    .startOf("day")
    .toDate();
  // Fetch continuous revision and back revision topics
  const continuousRevisionTopics = await studentData_1.StudyData.find({
    user: studentId,
    tag: "continuous_revision",
    createdAt: { $gte: today },
  }).exec();
  const backRevisionTopics = await studentData_1.StudyData.find({
    user: studentId,
    tag: "unrevised_topic",
  }).exec();
  // Generate daily topics
  const days = daysOfWeek.map((day, index) => {
    const date = (0, moment_timezone_1.default)(startDate)
      .add(index, "days")
      .tz(timezone)
      .toDate();
    // Get topics for the day
    const dailyTopics = (0, getDailyTopics_1.getDailyTopics)(
      continuousRevisionTopics,
      backRevisionTopics,
    );
    console.log("dailtpoc", dailyTopics);
    // Resetting the tag for continuousRevisionTopics tag
    // continuousRevisionTopics.forEach(topic => topic.tag = "");
    return { day, date, topics: dailyTopics };
  });
  const generatedPlanner = new plannerModel_1.default({
    student: studentId,
    startDate,
    endDate,
    days,
  });
  const planner = await plannerModel_1.default.create(generatedPlanner);
  console.log(planner);
  return planner;
};
exports.generateWeeklyPlanner = generateWeeklyPlanner;
