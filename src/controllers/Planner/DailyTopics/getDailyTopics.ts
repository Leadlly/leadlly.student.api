import IDataSchema from "../../../types/IDataSchema";
import { PlannerChapter } from "../../../types/IPlanner";
import IUser from "../../../types/IUser";

export const getDailyTopics = (
  continuousRevisionTopics: IDataSchema[],
  backRevisionTopics: IDataSchema[],
  user: IUser,
  chapters?: PlannerChapter[],
) => {
  const dailyBackTopics: IDataSchema[] = [];

  // If continuous revision topics are available
  if (continuousRevisionTopics.length > 0) {
    // Add 3 back revision topics
    for (let i = 0; i < 3; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyBackTopics.push(backTopic);
      }
    }
  } else {
    // If no continuous revision topics, add 3 back revision topics
    for (let i = 0; i < 3; i++) {
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
    dailyBackTopics,
    dailyBackChapters: dailyChapter, 
  };
};
