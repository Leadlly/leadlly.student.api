
import moment from 'moment-timezone';
import Planner from '../../../models/plannerModel';
import { StudyData } from '../../../models/studentData'; // Import the model
import IDataSchema from '../../../types/IDataSchema'; // Import the interface
import { getDailyTopics } from '../DailyTopics/getDailyTopics';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timezone = 'Asia/Kolkata';

type Topic = {
    name: string;
    studiedDate: Date;
    quizScores: number[];
    weeklyTestScore: number;
    efficiency?: number;
};

type WeeklyPlanner = {
    continuousRevisionTopics: Topic[];
    continuousLowEfficiencyTopics: Topic[];
    unrevisedLowEfficiencyTopics: Topic[];
    unrevisedTopics: Topic[];
    moderateEfficiencyTopics: Topic[];
};

export const generateWeeklyPlanner = async (studentId: string) => {
  const startDate = moment().tz(timezone).startOf('isoWeek').toDate();
  const endDate = moment().tz(timezone).endOf('isoWeek').toDate();

  const today = moment().tz(timezone).startOf('day').toDate();

  // Fetch continuous revision and back revision topics
  const continuousRevisionTopics = await StudyData.find({
    user: studentId,
    tag: 'continuous_revision',
    createdAt: { $gte: today },
  }).exec() as IDataSchema[];

  const backRevisionTopics = await StudyData.find({
    user: studentId,
    tag: 'unrevised_topic',
  }).exec() as IDataSchema[];

  // Function to calculate efficiency
  const calculateEfficiency = (topics: Topic[]): void => {
    topics.forEach(topic => {
      const totalQuizScore = topic.quizScores.reduce((a, b) => a + b, 0);
      const averageQuizScore = topic.quizScores.length ? totalQuizScore / topic.quizScores.length : 0;
      const averageQuizPercentage = (averageQuizScore / 100) * 100;
      const weeklyTestPercentage = (topic.weeklyTestScore / 100) * 100;
      const efficiency = (averageQuizPercentage + weeklyTestPercentage) / 2;
      topic.efficiency = efficiency;
    });
  };

  // Convert IDataSchema to Topic
  const convertToTopic = (data: IDataSchema): Topic => ({
    name: data.topic,
    studiedDate: data.createdAt || new Date(), 
    quizScores: data.quizScores || [],
    weeklyTestScore: data.weeklyTestScore || 0
  });

  const continuousTopics = continuousRevisionTopics.map(convertToTopic);
  const unrevisedTopics = backRevisionTopics.map(convertToTopic);

  // Calculate efficiencies
  calculateEfficiency(continuousTopics);
  calculateEfficiency(unrevisedTopics);

  // Classify topics
  const continuousRevision = continuousTopics.filter(topic => {
    const daysSinceStudied = (new Date().getTime() - new Date(topic.studiedDate).getTime()) / (1000 * 3600 * 24);
    return daysSinceStudied <= 14;
  });

  const continuousLowEfficiency = continuousRevision.filter(topic => topic.efficiency! < 40);
  const unrevisedLowEfficiency = unrevisedTopics.filter(topic => topic.efficiency! < 40);
  const moderateEfficiency = continuousTopics.filter(topic => topic.efficiency! >= 40 && topic.efficiency! < 50);

  // Generate daily topics
  const days = daysOfWeek.map((day, index) => {
    const date = moment(startDate).add(index, 'days').tz(timezone).toDate();

    // Get topics for the day
    const dailyTopics = getDailyTopics(
      continuousRevision,
      continuousLowEfficiency,
      unrevisedLowEfficiency,
      unrevisedTopics,
      moderateEfficiency
    );

    return { day, date, topics: dailyTopics };
  });

  const generatedPlanner = new Planner({
    student: studentId,
    startDate,
    endDate,
    days,
  });

  const planner = await Planner.create(generatedPlanner);
  console.log(planner);
  return planner;
};
