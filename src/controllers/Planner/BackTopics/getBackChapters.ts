import mongoose from "mongoose";
import { questions_db } from "../../../db/db";
import { CustomError } from "../../../middlewares/error";
import { StudyData } from "../../../models/studentData";
import IDataSchema from "../../../types/IDataSchema";
import { PlannerChapter } from "../../../types/IPlanner";
import IUser from "../../../types/IUser";
import { create_chapter_quiz } from "../../Quiz/ChapterQuiz";
import Tracker from "../../../models/trackerModel";


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
        const chapterId = topic.chapter.id.toString();
        if (!acc[chapterId]) {
          acc[chapterId] = [];
        }
        acc[chapterId].push(topic);
        return acc;
      },
      {} as Record<string, IDataSchema[]>
    );

    const resultChapters: PlannerChapter[] = [];

    // Step 2: For each unique chapter, fetch topics from the database and compare
    for (const [chapterId, groupedTopics] of Object.entries(groupedChapters)) {
      // Fetch all topics associated with this chapter from the database
      const dbTopics = await Topics.find({ chapterId }).toArray();

      // Step 3: Check if the number of topics in the input matches the number of topics in the database
      if (groupedTopics.length === dbTopics.length) {
        // Now, we will check if the topics are the same
        const allTopicsMatched = groupedTopics.every((groupedTopic) =>
          dbTopics.some((dbTopic) => dbTopic._id === groupedTopic.topic.id)
        );

        // Step 4: If all topics match, push the chapter to the result array with name field
        if (allTopicsMatched) {
          const chapterId = new mongoose.Types.ObjectId(groupedTopics[0].chapter.id)

          const trackerData = await Tracker.findOne({ user: user._id, "chapter.id": chapterId})
          if (trackerData) {
            if (!trackerData.chapter.studiedAt) {
              trackerData.chapter.studiedAt = [];
            }
            trackerData.chapter.studiedAt.push({ date: new Date(Date.now()), efficiency: 0 });

            if (!trackerData.chapter.plannerFrequency) {
              trackerData.chapter.plannerFrequency = 0;
            }
            trackerData.chapter.plannerFrequency += 1;

            // if (trackerData.tag === "unrevised_topic") {
            //   trackerData.tag = "active_unrevised_topic";
            // } else if (trackerData.tag === "active_unrevised_topic") {
            //   trackerData.tag = "inflow_unrevised_topic"
            // } else if ( trackerData.tag === "active_continuous_revision") {
            //   trackerData.tag = "inflow_continuous_revision"
            // }

            await trackerData.save();
          }

          resultChapters.push({ id: chapterId, name: groupedTopics[0].chapter.name, subject: groupedTopics[0].subject.name }); // Push as an object with name field
        }
      } 
    }

    let chaptersWithQuiz;
    try {
      chaptersWithQuiz = await create_chapter_quiz(user, resultChapters)
    } catch (error) {
      console.log(error)
    }

    return chaptersWithQuiz || resultChapters;

  } catch (error) {
    throw new CustomError((error as Error).message);
  }
};

