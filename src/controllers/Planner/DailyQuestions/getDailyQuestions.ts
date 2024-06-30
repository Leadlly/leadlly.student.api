import { Collection } from "mongodb";
import { questions_db } from "../../../db/db";
import IDataSchema from "../../../types/IDataSchema";

export const getDailyQuestions = async (day: string, date: Date, dailyTopics: IDataSchema[]) => {
  try {
    const questions: Collection = questions_db.collection("questionbanks");
    const results: { [key: string]: any[] } = {};
    const categories = ["jeemains_easy", "neet", "boards", "jeemains", "jeeadvance"];

    for (let topicData of dailyTopics) {
      const topic = topicData.topic.name;
      console.log(topic)
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
