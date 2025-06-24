import { Request, Response, NextFunction } from "express";
import { Collection, ObjectId } from "mongodb";
import { Quiz } from "../../../models/quizModel";
import { questions_db } from "../../../db/db";

export const createCustomQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      subjects,
      chapters = [],
      topics = [],
      questionsNumber = 5,
      level,
      createdBy,
      endDate,
      classId,
      userId,
    } = req.body;

    const user = userId || req.user._id;

    // ✅ Validate required 'subjects'
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res
        .status(400)
        .json({ message: "Missing required parameter: subjects" });
    }

    // ✅ Validate at least one of chapters or topics is provided
    if (
      (!chapters || chapters.length === 0) &&
      (!topics || topics.length === 0)
    ) {
      return res
        .status(400)
        .json({ message: "Provide at least one of: chapters or topics" });
    }

    const questionsCollection: Collection =
      questions_db.collection("questionbanks");

    const query: any = {
      subject: { $in: subjects },
    };

    if (chapters.length > 0) {
      query.chaptersId = {
        $in: chapters.map((id: string) => new ObjectId(id)),
      };
    }

    if (topics.length > 0) {
      query.topicsId = { $in: topics.map((id: string) => new ObjectId(id)) };
    }

    if (level) {
      query.level = level;
    }

    const sampledQuestions = await questionsCollection
      .aggregate([{ $match: query }, { $sample: { size: questionsNumber } }])
      .toArray();

    // Group questions by topic name
    const questionsByTopic: Record<string, ObjectId[]> = {};
    for (const question of sampledQuestions) {
      if (!Array.isArray(question.topics) || question.topics.length === 0)
        continue;

      for (const topicName of question.topics) {
        if (!questionsByTopic[topicName]) {
          questionsByTopic[topicName] = [];
        }
        questionsByTopic[topicName].push(question._id);
      }
    }

    const quiz = await Quiz.create({
      user: user,
      questions: questionsByTopic,
      quizType: "custom",
      createdAt: new Date(),
      createdBy: createdBy || "student",
      class: classId ? new ObjectId(classId) : null,
      endDate: endDate
        ? new Date(endDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      customParams: { subjects, chapters, topics, level },
    });

    res.status(200).json({
      message: "Custom quiz created successfully",
      data: quiz,
    });
  } catch (error: any) {
    console.error("Custom Quiz Error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getCustomQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, classId } = req.query as {
      userId: string;
      classId: string;
    };

    const query: any = {
      quizType: "custom",
    };

    if (userId) {
      query.user = userId;
    }

    if (classId) {
      query.class = new ObjectId(classId);
    }

    const customQuizzes = await Quiz.find(query);

    res.status(200).json({
      message: "Custom quizzes fetched successfully",
      data: customQuizzes,
    });
  } catch (error: any) {
    console.error("Custom Quizzes Error:", error);
    res.status(500).json({ message: error.message });
  }
};
