import { Collection } from "mongodb";
import { questions_db } from "../../../db/db"; 

export const getDailyQuestions = async (day: string, date: Date, dailyTopics: any[]) => {
  try {
    const questions: Collection = questions_db.collection("questions");
    const results: { [key: string]: any[] } = {};

    const query = { topics: { $in: dailyTopics } };

    const allTopicQuestions = await questions.find(query).toArray();

    for (let topic of dailyTopics) {
      results[topic] = allTopicQuestions.filter(question => question.topics.includes(topic));
    }

    return results;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve daily questions");
  }
};
