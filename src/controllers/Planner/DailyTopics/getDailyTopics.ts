import IDataSchema from "../../../types/IDataSchema";
import { IDay } from "../../../types/IPlanner";

export const getDailyTopics = (
  continuousRevision: IDataSchema[],
  continuousLowEfficiency: IDataSchema[],
  unrevisedLowEfficiency: IDataSchema[],
  unrevisedTopics: IDataSchema[],
  moderateEfficiency: IDataSchema[]
) => {
  const dailyTopics: IDataSchema[] = [];

  // Add continuous revision topics
  while (continuousRevision.length > 0 && dailyTopics.length < 3) {
    const topic = continuousRevision.shift();
    if (topic) {
      dailyTopics.push(topic);
    }
  }

  // Add continuous revision topics with efficiency < 40%
  while (continuousLowEfficiency.length > 0 && dailyTopics.length < 3) {
    const topic = continuousLowEfficiency.shift();
    if (topic) {
      dailyTopics.push(topic);
    }
  }

  // Add unrevised topics with efficiency < 40%
  while (unrevisedLowEfficiency.length > 0 && dailyTopics.length < 3) {
    const topic = unrevisedLowEfficiency.shift();
    if (topic) {
      dailyTopics.push(topic);
    }
  }

  // Add unrevised topics
  while (unrevisedTopics.length > 0 && dailyTopics.length < 3) {
    const topic = unrevisedTopics.shift();
    if (topic) {
      dailyTopics.push(topic);
    }
  }

  // Add topics with efficiency >= 40% but < 50%
  while (moderateEfficiency.length > 0 && dailyTopics.length < 3) {
    const topic = moderateEfficiency.shift();
    if (topic) {
      dailyTopics.push(topic);
    }
  }

  return dailyTopics;
};