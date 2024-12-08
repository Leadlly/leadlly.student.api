import { Collection } from "mongodb";
import { questions_db } from "../../../db/db";
import IDataSchema from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";

export const getDailyQuestions = async (
  day: string,
  date: Date,
  dailyTopics: IDataSchema[],
  user: IUser,
  dailySubtopics?: any,
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

    const userStandard = user.academic.standard;
    let standardsToFetch = [userStandard];

    if (userStandard === 12 || 13) {
      standardsToFetch = [11, 12]; // Include questions for standards 11 and 12
    }

    // Function to fetch questions based on a query (for topics or subtopics)
    const fetchQuestions = async (
      queryField: string, // Field to query: 'topics' or 'subtopics'
      name: string,       
      remainingQuestions: number
    ) => {
      const topicResults: any[] = [];

      for (let category of categories) {
        if (remainingQuestions > 0) {
          const query = {
            [queryField]: name,  // Dynamically query either 'topics' or 'subtopics'
            level: category,
            standard: { $in: standardsToFetch }, 
          };

          const topicQuestions = await questions
            .aggregate([
              { $match: query },
              { $sample: { size: remainingQuestions } },
            ])
            .toArray();

          topicResults.push(...topicQuestions);
          remainingQuestions -= topicQuestions.length;
        } else {
          break;
        }
      }

      return topicResults;
    };

    // Fetch questions for topics
    for (let topicData of dailyTopics) {
      const topic = topicData.topic.name;
      results[topic] = [];
      
      // Set remainingQuestions based on user preference
      let remainingQuestions = user.preferences?.dailyQuestions || 3;

      // Fetch topic questions
      const topicQuestions = await fetchQuestions("topics", topic, remainingQuestions);
      results[topic].push(...topicQuestions);
    }

    // Fetch questions for subtopics if provided
    if (dailySubtopics) {
      for (let subtopicData of dailySubtopics) {
        const topic = subtopicData.topic.name;
        const subtopic = subtopicData.subtopic.name;

        // Ensure the topic exists in the results, even if it has no main topic questions
        if (!results[subtopic]) {
          results[subtopic] = [];
        }

        // Set remainingQuestions based on user preference
        let remainingQuestions = user.preferences?.dailyQuestions || 3;

        // Fetch subtopic questions
        const subtopicQuestions = await fetchQuestions("subtopics", subtopic, remainingQuestions);

        // Add subtopic questions under the topic
        results[subtopic].push(...subtopicQuestions);
      }
    }

    console.log(results, "question result")
    return results;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve daily questions");
  }
};
