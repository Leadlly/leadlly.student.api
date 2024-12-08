import IDataSchema from "../../../types/IDataSchema";
import { PlannerChapter } from "../../../types/IPlanner";
import IUser from "../../../types/IUser";

export const getDailyTopics = (
  continuousRevisionTopics: IDataSchema[],
  backRevisionTopics: IDataSchema[],
  user: IUser,
  continuousRevisionSubTopics?: any,
  chapters?: PlannerChapter[],
) => {
  const dailyBackTopics: IDataSchema[] = [];
  let topicsToAdd = user?.preferences?.backRevisionTopics || 3; // Default to 3 topics

  // If continuous revision topics are available
  if (continuousRevisionTopics.length > 0) {
    // Add back revision topics based on the determined number
    for (let i = 0; i < topicsToAdd; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyBackTopics.push(backTopic);
      }
    }
  } else {
    // If no continuous revision topics, add back revision topics based on the determined number
    for (let i = 0; i < topicsToAdd; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyBackTopics.push(backTopic);
      }
    }
  }

  const dailyChapter: PlannerChapter[] = [];

  // Ensure only one chapter is added per day
  if (chapters && chapters.length > 0) {
    const chapter = chapters.shift();
    if (chapter) {
      dailyChapter.push(chapter);
    }
  }

  return {
    dailyContinuousTopics: continuousRevisionTopics,
    dailyContinuousSubtopics: continuousRevisionSubTopics,
    dailyBackTopics,
    dailyBackChapters: dailyChapter, 
  };
};
