import IDataSchema from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";

export const getDailyTopics = (
  continuousRevisionTopics: IDataSchema[],
  backRevisionTopics: IDataSchema[],
  user: IUser,
) => {
  const dailyBackTopics: IDataSchema[] = [];

  // If continuous revision topics are available
  if (continuousRevisionTopics.length > 0) {
    // Add 2 back revision topics
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

  return {
    dailyContinuousTopics: continuousRevisionTopics,
    dailyBackTopics,
  };
};
