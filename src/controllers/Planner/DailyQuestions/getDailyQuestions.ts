import { Collection } from "mongodb";
import { questions_db } from "../../../db/db";

export const getDailyQuestions = async (day: string, date: Date, dailyTopics: any[]) => {
  try {
    const questions: Collection = questions_db.collection("questions");
    const results: { [key: string]: any[] } = {};
    const categories = ["jeemains_easy", "neet", "boards", "jeemains", "jeeadvance"];
    
    for (let topic of dailyTopics) {
      results[topic] = [];
      let remainingQuestions = 3;

      for (let category of categories) {
        if (remainingQuestions > 0) {
          const query = { topics: topic, level: category };
          const topicQuestions = await questions.aggregate([
            { $match: query },
            { $sample: { size: remainingQuestions } }
          ]).toArray();

          results[topic].push(...topicQuestions);
          remainingQuestions -= topicQuestions.length;
        } else {
          break;
        }
      }
    }
    return results;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve daily questions");
  }
};
