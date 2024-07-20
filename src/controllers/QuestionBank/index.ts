import { questions_db } from "../../db/db";
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { ObjectId } from "mongodb";

export const getChapter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { subjectName, standard } = req.query;

    if (!subjectName || !standard) {
      return res.status(400).json({
        success: false,
        message: "subjectName and standard are required in query params",
      });
    }

    let standardQuery: any;
    if (standard === "13") {
      standardQuery = { $in: ["11", "12"] };
    } else {
      standardQuery = { $regex: new RegExp(`^${standard}$`, "i") };
    }

    const chapters = await questions_db
      .collection("chapters")
      .find({
        subjectName: { $regex: new RegExp(`^${subjectName}$`, "i") },
        standard: standardQuery,
      })
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
  next: NextFunction,
) => {
  try {
    const { standard, subjectName, chapterName } = req.query;

    if (!standard || !subjectName || !chapterName) {
      return res.status(400).json({
        success: false,
        message:
          "Standard, subjectName, and chapterName are required in query params",
      });
    }

    let standardQuery: any;
    if (standard === "13") {
      standardQuery = { $in: ["11", "12"] };
    } else {
      standardQuery = { $regex: new RegExp(`^${standard}$`, "i") };
    }

    const topicQuery = {
      standard: standardQuery,
      subjectName: new RegExp(`^${subjectName}$`, "i"),
      chapterName: new RegExp(`^${chapterName}$`, "i"),
    };

    const topics = await questions_db
      .collection("topics")
      .find(topicQuery)
      .toArray();

    if (topics.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No topics found for the specified standard, subjectName, and chapterName",
      });
    }

    console.log("Found Topics:", topics);

    res.status(200).json({
      success: true,
      topics,
    });
  } catch (error: any) {
    console.error("Error in getTopic:", error);
    next(new CustomError(error.message));
  }
};


export const getStreakQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
