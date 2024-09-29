import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../../middlewares/error';
import SolvedQuestions from '../../models/solvedQuestions';
import ErrorNotes from '../../models/ErrorNotesModel';
import { questions_db } from '../../db/db'; // Import your questions_db connection
import { SubjectProps, ChapterProps, ErrorBookProps, ErrorNoteProps} from '../../types/IErrorbook'


export const getErrorBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Fetch all solved questions for the user where isCorrect is false
        const solvedQuestions = await SolvedQuestions.find({
            student: req.user._id,
            isCorrect: false,
        });

        // Step 2: Get the question IDs from the solved questions
        const questionIds = solvedQuestions.map(sq => sq.question);

        // Step 3: Fetch question details from the questions_db using the question IDs
        const questions = await questions_db
            .collection('questionbanks')
            .find({ _id: { $in: questionIds } })
            .toArray();

        // Step 4: Initialize the structure for the error book
        const errorBook: SubjectProps[] = [];

        // Step 5: Group questions by subject and chapter
        const subjectMap: { [key: string]: { chapters: { [key: string]: number } } } = {};

        for (const question of questions) {
            const subject = question.subject;
            const chapter = question.chapter[0]; // Assuming chapter is an array

            // Initialize the subject in the subject map if not present
            if (!subjectMap[subject]) {
                subjectMap[subject] = { chapters: {} };
            }

            // Initialize the chapter count if not present
            if (!subjectMap[subject].chapters[chapter]) {
                subjectMap[subject].chapters[chapter] = 0;
            }

            // Increment the totalQuestions for this chapter
            subjectMap[subject].chapters[chapter] += 1;
        }

        // Convert the subjectMap to the desired errorBook structure
        for (const subject in subjectMap) {
            const chaptersArray: ChapterProps[] = Object.entries(subjectMap[subject].chapters).map(([chapter, totalQuestions]) => ({
                chapter,
                totalQuestions,
            }));

            errorBook.push({
                subject,
                chapters: chaptersArray,
            });
        }

        // Step 6: Get the error notes for the user
        const errorNotes = await ErrorNotes.find({
            student: req.user._id,
        }).sort({ createdAt: -1 });

        // Check for data existence and respond accordingly
        if ((errorNotes.length < 1) && (errorBook.length < 1)) {
            return res.status(404).json({
                success: false,
                message: 'No Uncompleted Error Notes or ErrorBook data found for this user',
            });
        }

        // Step 7: Prepare the final response data
        const responseData: ErrorBookProps = {
            errorBook,
            errorNotes,
        };

        // Step 8: Send the final response
        return res.status(200).json({
            success: true,
            ...responseData,
        });
    } catch (error: any) {
        console.error('Error in getErrorBook:', error);
        next(new CustomError(error.message));
    }
};
