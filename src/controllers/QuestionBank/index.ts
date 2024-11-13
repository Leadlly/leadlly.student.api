import { questions_db } from "../../db/db";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import IUser from "../../types/IUser";
import mongoose from "mongoose";

const getExamTags = (competitiveExam?: string): string[] => {
  switch (competitiveExam?.toLowerCase()) {
    case "jee":
      return ["jeemains", "jeeadvance"];
    case "neet":
      return ["neet"];
    case "boards":
      return ["boards"];
    default:
      return [];
  }
};

export const getChapter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subjectName, standard } = req.query;
    const competitiveExam = req.user?.academic?.competitiveExam;

    if (!subjectName || !standard) {
      return res.status(400).json({
        success: false,
        message: "subjectName and standard are required in query params",
      });
    }

    const standardNumber = parseInt(standard as string, 10);

    let standardQuery: any;
    if (standardNumber === 12 || standardNumber === 13) {
      standardQuery = { $in: [11, 12] };
    } else {
      standardQuery = standardNumber;
    }

    const examTags = getExamTags(competitiveExam);

    const chapters = await questions_db
      .collection("chapters")
      .aggregate([
        {
          $match: {
            subjectName: { $regex: new RegExp(`^${subjectName}$`, "i") },
            standard: standardQuery,
            exam: { $in: examTags },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ])
      .toArray();

    if (chapters.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chapters found for the subject",
      });
    }

    res.status(200).json({
      success: true,
      chapters,
    });
  } catch (error: any) {
    console.error("Error in getChapter:", error);
    next(new CustomError(error.message));
  }
};

export const getTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { standard, subjectName, chapterId } = req.query;
    const competitiveExam = req.user?.academic?.competitiveExam;

    if (!standard || !subjectName || !chapterId) {
      return res.status(400).json({
        success: false,
        message:
          "Standard, subjectName, and chapterId are required in query params",
      });
    }

    let standardQuery: any;

    const standardNumber = parseInt(standard as string, 10);

    if (standardNumber === 12 || standardNumber === 13) {
      standardQuery = { $in: [11, 12] };
    } else {
      standardQuery = standardNumber;
    }

    const examTags = getExamTags(competitiveExam);

    const topicQuery = {
      standard: standardQuery,
      subjectName: new RegExp(`^${subjectName}$`, "i"),
      chapterId: new mongoose.Types.ObjectId(chapterId as string),
      exam: { $in: examTags },
    };

    const topics = await questions_db
      .collection("topics")
      .aggregate([
        { $match: topicQuery },
        {
          $project: {
            _id: 1,
            name: 1,
            chapterId: 1,
          },
        },
      ])
      .toArray();

    if (topics.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No topics found for the specified standard, subjectName, and chapterName",
      });
    }

    res.status(200).json({
      success: true,
      topics,
    });
  } catch (error: any) {
    console.error("Error in getTopic:", error);
    next(new CustomError(error.message));
  }
};

export const getTopicWithSubtopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { standard, subjectName, chapterId } = req.query;
    const competitiveExam = req.user?.academic?.competitiveExam;

    // Validate required query params
    if (!standard || !subjectName || !chapterId) {
      return next(new CustomError("Standard, subjectName, and chapterId are required in query params", 400));
    }

    const standardNumber = parseInt(standard as string, 10);
    const standardQuery = (standardNumber === 12 || standardNumber === 13) ? { $in: [11, 12] } : standardNumber;
    const examTags = getExamTags(competitiveExam); // Get exam tags based on competitiveExam

    // Construct topic query
    const topicQuery = {
      standard: standardQuery,
      subjectName: new RegExp(`^${subjectName}$`, "i"),
      chapterId: new mongoose.Types.ObjectId(chapterId as string),
      ...(examTags.length > 0 && { exam: { $in: examTags } }), // Only add the exam condition if examTags are present
    };

    // Aggregate query to fetch topics with subtopics details
    let topics = await questions_db
      .collection("topics")
      .aggregate([
        { $match: topicQuery },
        {
          $lookup: {
            from: "subtopics",
            localField: "subtopics",
            foreignField: "_id",
            as: "subtopicsDetails",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            chapterId: 1,
            subtopics: {
              $map: {
                input: "$subtopicsDetails",
                as: "subtopic",
                in: { _id: "$$subtopic._id", name: "$$subtopic.name" },
              },
            },
          },
        },
      ])
      .toArray();

    // Check if no topics found, and if not, query again without the exam filter
    if (topics.length === 0) {
      topics = await questions_db
        .collection("topics")
        .aggregate([
          { $match: { standard: standardQuery, subjectName: new RegExp(`^${subjectName}$`, "i"), chapterId: new mongoose.Types.ObjectId(chapterId as string) } },
          {
            $lookup: {
              from: "subtopics",
              localField: "subtopics",
              foreignField: "_id",
              as: "subtopicsDetails",
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              chapterId: 1,
              subtopics: {
                $map: {
                  input: "$subtopicsDetails",
                  as: "subtopic",
                  in: { _id: "$$subtopic._id", name: "$$subtopic.name" },
                },
              },
            },
          },
        ])
        .toArray();

      if (topics.length === 0) {
        return next(new CustomError("No topics found for the specified standard, subjectName, and chapterId", 400));
      }
    }

    // Send successful response
    res.status(200).json({
      success: true,
      topics,
    });
  } catch (error: any) {
    console.error("Error in getTopicWithSubtopics:", error);
    next(new CustomError(error.message));
  }
};


export const getSubtopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: IUser = req.user;

    const Subtopic = questions_db.collection("subtopics");

    // Destructure the required parameters from request body
    const { subjectName, chapterId, topicId } = req.query;

    const standard = user.academic.standard;

    let standardQuery: any;

    const standardNumber = standard;

    if (standardNumber === 12 || standardNumber === 13) {
      standardQuery = { $in: [11, 12] };
    } else {
      standardQuery = standardNumber;
    }


    // Check if all required parameters are provided
    if (!subjectName || !standard || !chapterId || !topicId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required query parameters (subjectName, standard, chapterId, chapterId).",
      });
    }

    // Fetch subtopics from the subtopics collection using the array of subtopic IDs
    const subtopics = await Subtopic.aggregate([
      {
        $match: {
          chapterId: new mongoose.Types.ObjectId(chapterId as string),
          topicId: new mongoose.Types.ObjectId(topicId as string),
          standard: standardQuery,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          topicId: 1,
          chapterId: 1,
        },
      },
    ]).toArray();

    // Return the fetched subtopics
    res.status(200).json({
      success: true,
      subtopics,
    });
  } catch (error) {
    // Pass any caught errors to the next middleware (error handling)
    next(new CustomError((error as Error).message, 500));
  }
};

export const getStreakQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const subjects = ["maths", "physics", "chemistry", "biology"];
    const level = "jeemains";

    const selectedQuestions: any = {};

    for (const subject of subjects) {
      const queryObject: any = {
        subject,
        level,
      };

      const questions = await questions_db
        .collection("questionbanks")
        .aggregate([{ $match: queryObject }, { $sample: { size: 1 } }])
        .toArray();

      if (questions && questions.length > 0) {
        selectedQuestions[subject] = questions[0];
      }
    }

    if (Object.keys(selectedQuestions).length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Questions not found" });
    }

    return res
      .status(200)
      .json({ success: true, questions: selectedQuestions });
  } catch (error: any) {
    console.error("Error in getStreakQuestion:", error);
    next(new CustomError(error.message));
  }
};
