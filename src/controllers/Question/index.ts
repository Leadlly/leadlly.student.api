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



export const getAllQuestion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const queryObject: any = {};

        if (req.query.standard) queryObject.standard = parseInt(req.query.standard as string, 10);
        if (req.query.subject) queryObject.subject = req.query.subject as string;
        if (req.query.chapter) queryObject.chapter = req.query.chapter as string;
        if (req.query.topics) queryObject.topics = req.query.topics as string;

        console.log('Query Object:', queryObject); 

        const questions = await questions_db.collection('questionbanks').find(queryObject).toArray();
        console.log('Questions found:', questions); 

        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }

        return res.status(200).json({ success: true, questions });
    } catch (error: any) {
        console.error('Error in getAllQuestion:', error);
        next(new CustomError(error.message));
    }
};