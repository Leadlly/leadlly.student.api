import { questions_db } from "../../../db/db";
import { CustomError } from "../../../middlewares/error";
import IDataSchema from "../../../types/IDataSchema";

export const getBackChapters = async (topics: IDataSchema[]) => {
  try {
    const Chapters = questions_db.collection("chapters");
    const Topics = questions_db.collection("topics");

    // Step 1: Group incoming topics by chapters
    const groupedChapters: Record<string, IDataSchema[]> = topics.reduce((acc: Record<string, IDataSchema[]>, topic) => {
      const chapterName = topic.chapter.name;
      if (!acc[chapterName]) {
        acc[chapterName] = [];
      }
      acc[chapterName].push(topic);
      return acc;
    }, {} as Record<string, IDataSchema[]>);

    const resultChapters: IDataSchema['chapter'][] = [];

    // Step 2: For each unique chapter, fetch topics from the database and compare
    for (const [chapterName, groupedTopics] of Object.entries(groupedChapters)) {
      // Fetch all topics associated with this chapter from the database
      const dbTopics = await Topics.find({ "chapterName": chapterName }).toArray();

      // Step 3: Check if the number of topics in the input matches the number of topics in the database
      if (groupedTopics.length === dbTopics.length) {
        // Now, we will check if the topics are the same
        const allTopicsMatched = groupedTopics.every((groupedTopic) =>
          dbTopics.some(
            (dbTopic) => dbTopic.name === groupedTopic.topic.name
          )
        );

        // Step 4: If all topics match, push the chapter to the result array
        if (allTopicsMatched) {
          resultChapters.push(groupedTopics[0].chapter); // Push the chapter object
        }
      }
    }

    return resultChapters;
  } catch (error) {
    throw new CustomError((error as Error).message);
  }
};
