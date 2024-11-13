import { Collection } from "mongodb";
import { questions_db } from "../../../db/db";
import IDataSchema from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";

export const getDailyQuestions = async (
  day: string,
  date: Date,
  dailyTopics: IDataSchema[],
  user: IUser
) => {
  try {
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

    for (let topicData of dailyTopics) {
      const topic = topicData.topic.name;
      results[topic] = [];
      let remainingQuestions = 3;

      for (let category of categories) {
        if (remainingQuestions > 0) {
          // Modify query to include user's standards
          const query = {
            topics: topic,
            level: category,
            standard: { $in: standardsToFetch }, // Match any of the standards
          };

          const topicQuestions = await questions
            .aggregate([
              { $match: query },
              { $sample: { size: remainingQuestions } },
            ])
            .toArray();

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
