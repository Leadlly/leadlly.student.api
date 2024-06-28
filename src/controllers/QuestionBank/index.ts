import { questions_db } from "../../db/db"
import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { ObjectId } from 'mongodb';


export const getChapter = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { subjectName, standard } = req.query;

        if (!subjectName || !standard) {
            return res.status(400).json({
                success: false,
                message: 'subjectName and standard are required in query params',
            });
        }

        const chapters = await questions_db
            .collection('chapters')
            .find({
                subjectName: { $regex: new RegExp(`^${subjectName}$`, 'i') },
                standard: { $regex: new RegExp(`^${standard}$`, 'i') },
            })
            .toArray();

        if (chapters.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No chapters found for the subject',
            });
        }

        res.status(200).json({
            success: true,
            chapters,
        });
    } catch (error: any) {
        console.error('Error in getChapter:', error);
        next(new CustomError(error.message));
    }
};

export const getTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { standard, subjectName, chapterName } = req.query;

    if (!standard || !subjectName || !chapterName) {
      return res.status(400).json({
        success: false,
        message: 'Standard, subjectName, and chapterName are required in query params',
      });
    }

    const standardStr = standard as string;
    const subjectNameStr = subjectName as string;
    const chapterNameStr = chapterName as string;

    console.log('Query Parameters:', { standardStr, subjectNameStr, chapterNameStr });

    // Build the query object
    const topicQuery = {
      standard: new RegExp(`^${standardStr}$`, 'i'),
      subjectName: new RegExp(`^${subjectNameStr}$`, 'i'),
      chapterName: new RegExp(`^${chapterNameStr}$`, 'i')
    };

    console.log('Topic Query:', JSON.stringify(topicQuery));

    // Fetch topics based on standard, subjectName, and chapterName
    const topics = await questions_db.collection('topics').find(topicQuery).toArray();

    if (topics.length === 0) {
      console.log('No topics found for the specified criteria:', { standardStr, subjectNameStr, chapterNameStr });
      return res.status(404).json({
        success: false,
        message: 'No topics found for the specified standard, subjectName, and chapterName',
      });
    }

    console.log('Found Topics:', topics);

    res.status(200).json({
      success: true,
      topics,
    });
  } catch (error: any) {
    console.error('Error in getChapter:', error);
    next(new CustomError(error.message));
}
};



export const getStreakQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const subjects = ['maths', 'physics', 'chemistry', 'biology'];
      const level = 'jeemains';

      const selectedQuestions: any = {};

      for (const subject of subjects) {
          const queryObject: any = {
              subject,
              level
          };

          console.log(`Query Object for ${subject}:`, queryObject);

          const questions = await questions_db.collection('questionbanks').aggregate([
              { $match: queryObject },
              { $sample: { size: 1 } }
          ]).toArray();

          console.log(`Questions found for ${subject}:`, questions);

          if (questions && questions.length > 0) {
              selectedQuestions[subject] = questions[0];
          }
      }

      if (Object.keys(selectedQuestions).length === 0) {
          return res.status(404).json({ success: false, message: "Questions not found" });
      }

      return res.status(200).json({ success: true, questions: selectedQuestions });
  } catch (error: any) {
      console.error('Error in getStreakQuestion:', error);
      next(new CustomError(error.message));
  }
};

