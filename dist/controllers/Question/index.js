"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestion = exports.getTopic = exports.getChapter = void 0;
const db_1 = require("../../db/db");
const error_1 = require("../../middlewares/error");
const getChapter = async (req, res, next) => {
    try {
        const { subjectName, standard } = req.query;
        if (!subjectName || !standard) {
            return res.status(400).json({
                success: false,
                message: 'subjectName and standard are required in query params',
            });
        }
        const chapters = await db_1.questions_db
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
    }
    catch (error) {
        console.error('Error in getChapter:', error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getChapter = getChapter;
const getTopic = async (req, res, next) => {
    try {
        const { standard, subject, chapterName } = req.query;
        if (!standard || !subject || !chapterName) {
            return res.status(400).json({
                success: false,
                message: 'standard, subject, and chapterName are required in query params',
            });
        }
        // Validate chapterName against standard and subject
        const chapter = await db_1.questions_db.collection('chapters').findOne({
            name: { $regex: new RegExp(`^${chapterName}$`, 'i') },
            standard: { $regex: new RegExp(`^${standard}$`, 'i') },
            subject: { $regex: new RegExp(`^${subject}$`, 'i') },
        });
        if (!chapter) {
            return res.status(404).json({
                success: false,
                message: 'Chapter not found for the specified standard, subject, and chapterName',
            });
        }
        // Fetch topics for the given chapterId
        const topics = await db_1.questions_db
            .collection('topics')
            .find({ chapterId: chapter._id })
            .toArray();
        if (topics.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No topics found for the specified chapter',
            });
        }
        res.status(200).json({
            success: true,
            topics,
        });
    }
    catch (error) {
        console.error('Error in getTopic:', error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getTopic = getTopic;
const getQuestion = async (req, res, next) => {
    try {
        const { standard, subject, chapter, topic } = req.query;
        // Check if standard, subject, chapter, and topic are provided
        if (!standard || !subject || !chapter || !topic) {
            return res.status(400).json({
                success: false,
                message: 'Standard, subject, chapter, and topic are required in query params',
            });
        }
        // Query questions based on standard, subject, chapter, and topic, case insensitive
        const questions = await db_1.questions_db
            .collection('questions')
            .find({
            standard: { $regex: new RegExp(`^${standard}$`, 'i') },
            subject: { $regex: new RegExp(`^${subject}$`, 'i') },
            chapter: { $regex: new RegExp(`^${chapter}$`, 'i') },
            topic: { $regex: new RegExp(`^${topic}$`, 'i') },
        })
            .toArray();
        // If no questions found, return 404
        if (questions.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No questions found for the specified parameters',
            });
        }
        // Return questions if found
        res.status(200).json({
            success: true,
            questions,
        });
    }
    catch (error) {
        console.error('Error in getQuestion:', error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getQuestion = getQuestion;
