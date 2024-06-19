import IDataSchema from "../../../types/IDataSchema";
import { IDay } from "../../../types/IPlanner";
import IUser from "../../../types/IUser";

export const getDailyTopics = (
  continuousRevisionTopics: IDataSchema[],
  backRevisionTopics: IDataSchema[],
  user: IUser
) => {
  const dailyTopics = [];

  // Add 3 continuous revision topics
  if (continuousRevisionTopics.length > 0) {
    const topic = continuousRevisionTopics.shift();
    if (topic) {
      dailyTopics.push(topic);
    }

    // Add 2 back revision topics
    for (let i = 0; i < 2; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyTopics.push(backTopic);
      }
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyTopics.push(backTopic);
      }
    }
  }

  return dailyTopics;
};
