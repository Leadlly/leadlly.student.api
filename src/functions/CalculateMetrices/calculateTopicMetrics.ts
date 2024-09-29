import SolvedQuestions from "../../models/solvedQuestions";
import IUser from "../../types/IUser";
import IDataSchema, { Topic } from "../../types/IDataSchema";
import { StudyData } from "../../models/studentData";
import { questions_db } from "../../db/db"; // Assuming the questions are stored in a database collection

export const calculateTopicMetrics = async (topics: Topic[], user: IUser) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch solved questions for the current day
    const solvedQuestions = await SolvedQuestions.aggregate([
      {
        $match: {
          student: user._id,
          createdAt: { $gte: today },
        },
      },
    ]);

    for (let topic of topics) {
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

      // Process each solved question and check if it belongs to the current topic
      for (const solvedQuestion of solvedQuestions) {
        // Fetch the full question details using the `questionId`
        const question = await questions_db.collection("questionbanks").findOne({
          _id: solvedQuestion.question,
        });

        if (question && question.topics.includes(topic.name)) {
          totalCount++;
          if (solvedQuestion.isCorrect) {
            correctCount++;
          }
        }
      }

      let efficiency = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

      // Increment the efficiency by 0.02 but cap it at 98%
      efficiency += 0.02;
      efficiency = Math.min(efficiency, 98);

      efficiency = Math.round(efficiency * 100) / 100;

      const existingEntryIndex = studyData.topic.studiedAt.findIndex((entry) => {
        if (!entry.date) {
          return false;
        }
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });

      if (existingEntryIndex !== -1) {
        studyData.topic.studiedAt[existingEntryIndex].efficiency = efficiency;
      } else {
        // Push a new entry
        studyData.topic.studiedAt.push({
          date: today,
          efficiency: efficiency,
        });
      }

      await studyData.save();

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
    // Fetch solved questions that belong to the specified topic
    const solvedQuestions = await SolvedQuestions.find({
      student: user._id,
    });

    let correctCount = 0;
    let totalCount = 0;

    for (const solvedQuestion of solvedQuestions) {
      // Fetch the full question details using the `questionId`
      const question = await questions_db.collection("questionbanks").findOne({
        _id: solvedQuestion.question,
      });

      if (question && question.topics.includes(topic.name)) {
        totalCount++;
        if (solvedQuestion.isCorrect) {
          correctCount++;
        }
      }
    }

    let efficiency = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    // Increment the efficiency by 0.02 but cap it at 98%
    efficiency += 0.02;
    efficiency = Math.min(efficiency, 98);

    // Round efficiency to two decimal places
    efficiency = Math.round(efficiency * 100) / 100;

    await StudyData.updateOne(
      { user: user._id, "topic.name": topic.name },
      { $set: { "topic.overall_efficiency": efficiency, updatedAt: new Date() } }
    );

    return efficiency;
  } catch (error) {
    console.error("Error calculating overall efficiency:", error);
    throw new Error("Failed to calculate overall efficiency");
  }
};
