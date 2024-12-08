import { Collection } from "mongoose";
import { PlannerChapter } from "../../../types/IPlanner";
import { questions_db } from "../../../db/db";
import SolvedQuestions from "../../../models/solvedQuestions";
import IUser from "../../../types/IUser";
import { Quiz } from "../../../models/quizModel";

export const create_chapter_quiz = async (user: IUser, chapters: PlannerChapter[]): Promise<PlannerChapter[]> => {
  try {
    const Question: Collection = questions_db.collection("questionbanks");
    const Topic: Collection = questions_db.collection("topics");

    const categories = [
      "jeemains_easy",
      "neet",
      "boards",
      "jeemains",
      "jeeadvance",
    ];

    const updatedChapters: PlannerChapter[] = [];

    // Function to get the next Saturday
    function getNextSaturday(date: Date) {
      const result = new Date(date);
      result.setDate(result.getDate() + ((6 - result.getDay() + 7) % 7));
      return result;
    }

    for (let chapter of chapters) {
      const chapterTopics = await Topic.find({ chapterName: chapter.name }).toArray();
      const results: { [key: string]: any[] } = {};

      for (let topicData of chapterTopics) {
        const topic = topicData.name;
        results[topic] = [];
        let remainingQuestions = 2;

        for (let category of categories) {
          if (remainingQuestions > 0) {
            const query = {
              topics: topic,
              level: category,
            };

            const topicQuestions = await Question.aggregate([
              { $match: query },
              { $sample: { size: remainingQuestions } },
            ]).toArray();

            for (const topicData of topicQuestions) {
              const solvedQuestions = await SolvedQuestions.findOne({
                student: user._id,
                "question.question": topicData._id,
              });

              if (!solvedQuestions) {
                // Store only the question ID instead of the full question
                results[topic].push(topicData._id);
                remainingQuestions -= topicQuestions.length;
              }
            }
          } else {
            break;
          }
        }
      }

      // Create a quiz for the current chapter
      const chapterQuiz = await Quiz.create({
        user: user._id,
        questions: results,
        quizType: "chapter",
        createdAt: new Date(),
        endDate: getNextSaturday(new Date()),
      });

      // Push the updated chapter with the quizId to the result array
      updatedChapters.push({
        id: chapter.id,  // Maintain the chapter's id if present
        name: chapter.name,
        subject: chapter.subject,
        quizId: chapterQuiz._id,  // Assign the created quiz's id
      });
    }

    return updatedChapters; // Return updated chapters with quiz IDs

  } catch (error) {
    console.error("Error creating chapter quiz:", error);
    throw new Error((error as Error).message); // Throw the error for better error handling
  }
};
