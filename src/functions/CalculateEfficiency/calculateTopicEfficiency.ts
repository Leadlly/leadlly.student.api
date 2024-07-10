import SolvedQuestions from "../../models/solvedQuestions";
import IUser from "../../types/IUser";
import IDataSchema, { Topic } from "../../types/IDataSchema";
import { StudyData } from "../../models/studentData";

export const calculateEfficiency = async (topics: Topic[], user: IUser) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const solvedQuestions = await SolvedQuestions.aggregate([
      {
        $match: {
          student: user._id,
          createdAt: { $gte: today },
        },
      },
    ]);

    for (let topic of topics) {
      // Fetch studyData for the topic
      const studyData = await StudyData.findOne({
        user: user._id,
        "topic.name": topic.name,
      });

      if (!studyData) {
        console.log(`No study data found for topic: ${topic.name}`);
        continue;
      }

      let correctCount = 0;
      let totalCount = 0;

      solvedQuestions.forEach((question) => {
        if (question.question.topics.includes(topic.name)) {
          totalCount++;
          if (question.isCorrect) {
            correctCount++;
          }
        }
      });

      let efficiency = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

      // Increment the efficiency by 0.02 but cap it at 98%
      efficiency += 0.02;
      efficiency = Math.min(efficiency, 98); // Cap at 98%

      // Round efficiency to two decimal places
      efficiency = Math.round(efficiency * 100) / 100;

      // Update the studyData topic's studiedAt array
      await StudyData.updateOne(
        { _id: studyData._id, "topic.name": topic.name },
        {
          $push: {
            "topic.studiedAt": {
              efficiency: efficiency,
            },
          },
        }
      );

      // Calculate overall efficiency
      topic.overall_efficiency = await calculateOverallEfficiency(topic, user);
    }

    console.log("Topic efficiencies calculated:", topics);
    return topics;
  } catch (error) {
    console.error("Error calculating topic efficiencies:", error);
    throw new Error("Failed to calculate topic efficiencies");
  }
};

export const calculateOverallEfficiency = async (topic: Topic, user: IUser) => {
  try {
    const solvedQuestions = await SolvedQuestions.find({
      student: user._id,
      "question.topics": { $in: [topic.name] },
    });

    let correctCount = 0;
    let totalCount = solvedQuestions.length;

    solvedQuestions.forEach((question) => {
      if (question.isCorrect) {
        correctCount++;
      }
    });

    let efficiency = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // Increment the efficiency by 0.02 but cap it at 98%
    efficiency += 0.02;
    efficiency = Math.min(efficiency, 98); // Cap at 98%

    // Round efficiency to two decimal places
    efficiency = Math.round(efficiency * 100) / 100;

    await StudyData.updateOne(
      { user: user._id, "topic.name": topic.name },
      { $set: { "topic.overall_efficiency": efficiency } }
    );

    return efficiency;
  } catch (error) {
    console.error("Error calculating overall efficiency:", error);
    throw new Error("Failed to calculate overall efficiency");
  }
};