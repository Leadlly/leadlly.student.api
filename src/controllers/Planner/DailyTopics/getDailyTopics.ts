import IDataSchema from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";

export const getDailyTopics = (
  continuousRevisionTopics: IDataSchema[],
  backRevisionTopics: IDataSchema[],
  user: IUser
) => {
  const dailyContinuousTopics: IDataSchema[] = [];
  const dailyBackTopics: IDataSchema[] = [];

  // Add 3 continuous revision topics
  if (continuousRevisionTopics.length > 0) {
    const topic = continuousRevisionTopics.shift();
    if (topic) {
      dailyContinuousTopics.push(topic);
    }

    // Add 2 back revision topics
    for (let i = 0; i < 2; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyBackTopics.push(backTopic);
      }
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const backTopic = backRevisionTopics.shift();
      if (backTopic) {
        dailyBackTopics.push(backTopic);
      }
    }
  }

  return {
    dailyContinuousTopics,
    dailyBackTopics
  };
};
