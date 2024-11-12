import IDataSchema from "../../../types/IDataSchema";
import IUser from "../../../types/IUser";

export const getDailyTopics = (
  continuousRevisionTopics: IDataSchema[],
  backRevisionTopics: IDataSchema[],
  user: IUser,
  continuousRevisionSubTopics?: any,
) => {
  const dailyBackTopics: IDataSchema[] = [];
  let topicsToAdd = 5; // Default to 5 topics

  // Determine the number of topics to add based on the user's standard
  if (user.academic.standard === 11) {
    topicsToAdd = 3; // Add 3 topics for standard 11
  } else if (user.academic.standard === 12 || user.academic.standard === 13) {
    topicsToAdd = 5; // Add 5 topics for standards 12 and 13
  }

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

  return {
    dailyContinuousTopics: continuousRevisionTopics,
    dailyContinuousSubtopics: continuousRevisionSubTopics,
    dailyBackTopics,
  };
};
