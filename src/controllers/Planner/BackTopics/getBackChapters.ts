import { questions_db } from "../../../db/db";
import { CustomError } from "../../../middlewares/error";
import { StudyData } from "../../../models/studentData";
import IDataSchema from "../../../types/IDataSchema";
import { PlannerChapter } from "../../../types/IPlanner";
import IUser from "../../../types/IUser";
import { create_chapter_quiz } from "../../Quiz/ChapterQuiz";


export const getBackChapters = async (user: IUser) => {
  try {
    const Chapters = questions_db.collection("chapters");
    const Topics = questions_db.collection("topics");

    const activeContinuousRevisionTopics = (await StudyData.find({
      user: user._id,
      tag: "active_continuous_revision",
    }).exec()) as IDataSchema[];
  
    const activeUnrevisedTopics = (await StudyData.find({
      user: user._id,
      tag: "active_unrevised_topic",
    }).exec()) as IDataSchema[];
  
    const topics = [...activeContinuousRevisionTopics, ...activeUnrevisedTopics]

    // Step 1: Group incoming topics by chapters
    const groupedChapters: Record<string, IDataSchema[]> = topics.reduce(
      (acc: Record<string, IDataSchema[]>, topic) => {
        const chapterName = topic.chapter.name;
        if (!acc[chapterName]) {
          acc[chapterName] = [];
        }
        acc[chapterName].push(topic);
        return acc;
      },
      {} as Record<string, IDataSchema[]>
    );

    const resultChapters: PlannerChapter[] = [];

    // Step 2: For each unique chapter, fetch topics from the database and compare
    for (const [chapterName, groupedTopics] of Object.entries(groupedChapters)) {
      // Fetch all topics associated with this chapter from the database
      const dbTopics = await Topics.find({ chapterName }).toArray();

      // Step 3: Check if the number of topics in the input matches the number of topics in the database
      if (groupedTopics.length === dbTopics.length) {
        // Now, we will check if the topics are the same
        const allTopicsMatched = groupedTopics.every((groupedTopic) =>
          dbTopics.some((dbTopic) => dbTopic.name === groupedTopic.topic.name)
        );

        // Step 4: If all topics match, push the chapter to the result array with name field
        if (allTopicsMatched) {
          resultChapters.push({ name: groupedTopics[0].chapter.name }); // Push as an object with name field
        }
      }
    }

    const chaptersWithQuiz = await create_chapter_quiz(user, resultChapters)

    return chaptersWithQuiz;
  } catch (error) {
    throw new CustomError((error as Error).message);
  }
};

