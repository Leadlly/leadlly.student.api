import IUser from "../../../../types/IUser";
import moment from "moment-timezone";
import { Collection } from "mongodb";
import Planner from "../../../../models/plannerModel";
import SolvedQuestions from "../../../../models/solvedQuestions";
import { CustomError } from "../../../../middlewares/error";
import { questions_db } from "../../../../db/db";
import { Quiz } from "../../../../models/quizModel";

export const create_weekly_quiz = async(user: IUser) => {
    try {
        
    const timezone = "Asia/Kolkata";
    const currentMoment = moment.tz(timezone);

    // Calculate the start and end of next week
    const startDate = moment(currentMoment).startOf("isoWeek").toDate();
    const endDate = moment(startDate).endOf("isoWeek").toDate();

    const existingQuiz = await Quiz.findOne({
      user: user._id,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    if(existingQuiz) return {status: 400, message: "Quiz for current week already exists"}

    const currentWeekPlanner = await Planner.findOne({
      student: user._id,
      startDate: { $gte: startDate },
      endDate: { $lte: endDate },
    });

    if (!currentWeekPlanner) {
      return new CustomError("Planner for current week does not exist!");
    }

    // Get current week's Back Revision Topics
    const currentWeekBackRevisionTopics = currentWeekPlanner.days
      .map((day) => day.backRevisionTopics)
      .flatMap((item) => item);

    // Get current week's Continuous Revision Topics
    const currentWeekContinuousRevisionTopics = currentWeekPlanner.days
      .map((day) => day.continuousRevisionTopics)
      .flatMap((item) => item);

    if (
      currentWeekBackRevisionTopics.length === 0 &&
      currentWeekContinuousRevisionTopics.length === 0
    ) {
      return { status: 400, message: "No topics found in planner for this week" };
    }
    

    const weeklyTopics = [
      ...currentWeekContinuousRevisionTopics,
      ...currentWeekBackRevisionTopics,
    ];

    const questions: Collection = questions_db.collection("questionbanks");
    const results: { [key: string]: any[] } = {};
    const categories = [
      "jeemains_easy",
      "neet",
      "boards",
      "jeemains",
      "jeeadvance",
    ];

    // Determine which standards to include based on the user's standard
    const userStandard = user.academic.standard;
    let standardsToFetch = [userStandard];

    if (userStandard === 13) {
      standardsToFetch = [11, 12]; // Include questions for standards 11 and 12
    }

    for (let topicData of weeklyTopics) {
      const topic = topicData.topic.name;
      results[topic] = [];
      let remainingQuestions = 2;

      for (let category of categories) {
        if (remainingQuestions > 0) {
          const query = {
            topics: topic,
            level: category,
            standard: { $in: standardsToFetch },
          };
          const topicQuestions = await questions
            .aggregate([
              { $match: query },
              { $sample: { size: remainingQuestions } },
            ])
            .toArray();

          for (const topicData of topicQuestions) {
            const solvedQuestions = await SolvedQuestions.findOne({
              student: user._id,
              "question.question": topicData._id,
            });

            if (!solvedQuestions) {
              // Store only the question ID instead of the full question
              results[topic].push(topicData._id);
              remainingQuestions -= topicQuestions.length;
            }
          }
        } else {
          break;
        }
      }
    }

    function getNextSaturday(date: Date) {
      const result = new Date(date);
      result.setDate(result.getDate() + ((6 - result.getDay() + 7) % 7));
      return result;
    }

    const weeklyQuiz = await Quiz.create({
      user: user._id,
      questions: results,
      quizType: "weekly",
      createdAt: new Date(),
      endDate: getNextSaturday(new Date()),
    });

    return {status: 200, message: "Weekly quiz created successfully", data: weeklyQuiz}
    } catch (error: any) {
        console.log(error)
        return {status: 500, message: error.message}
    }
}