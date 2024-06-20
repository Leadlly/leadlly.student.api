"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllQuestion = exports.getTopic = exports.getChapter = void 0;
const db_1 = require("../../db/db");
const error_1 = require("../../middlewares/error");
const mongodb_1 = require("mongodb");
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
        const { standard, subjectName, chapterName } = req.query;
        // Type cast to string
        const standardStr = standard;
        const subjectNameStr = subjectName;
        const chapterNameStr = chapterName;
        if (!standardStr || !subjectNameStr || !chapterNameStr) {
            return res.status(400).json({
                success: false,
                message: 'standard, subjectName, and chapterName are required in query params',
            });
        }
        console.log('Query Parameters:', { standardStr, subjectNameStr, chapterNameStr });
        const chapterNameArray = chapterNameStr.split(',').map(name => name.trim());
        // Build the query object
        const chapterQuery = {
            standard: { $regex: new RegExp(`^${standardStr}$`, 'i') },
            subject: { $regex: new RegExp(`^${subjectNameStr}$`, 'i') },
            name: { $in: chapterNameArray.map(name => new RegExp(`^${name}$`, 'i')) }
        };
        console.log('Chapter Query:', JSON.stringify(chapterQuery));
        // Check entries for standard and subjectName
        const chapters = await db_1.questions_db.collection('chapters').find(chapterQuery).toArray();
        if (chapters.length === 0) {
            console.log('No chapters found for standard and subjectName:', { standardStr, subjectNameStr });
            return res.status(404).json({
                success: false,
                message: 'No chapters found for the specified standard and subjectName',
            });
        }
        console.log('Chapters found for standard and subjectName:', chapters);
        // Validate chapterName against standard and subject
        const chapterIds = chapters.map(chap => chap._id);
        // Fetch topics for the given chapterIds
        const topics = await db_1.questions_db
            .collection('topics')
            .find({ chapterId: { $in: chapterIds.map(id => new mongodb_1.ObjectId(id)) } })
            .toArray();
        if (topics.length === 0) {
            console.log('No topics found for chapters:', chapterIds);
            return res.status(404).json({
                success: false,
                message: 'No topics found for the specified chapters',
            });
        }
        console.log('Found Topics:', topics);
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
const getAllQuestion = async (req, res, next) => {
    try {
        const queryObject = {};
        if (req.query.standard)
            queryObject.standard = parseInt(req.query.standard, 10);
        if (req.query.subject)
            queryObject.subject = req.query.subject;
        if (req.query.chapter)
            queryObject.chapter = req.query.chapter;
        if (req.query.topics)
            queryObject.topics = req.query.topics;
        console.log('Query Object:', queryObject);
        const questions = await db_1.questions_db.collection('questionbanks').find(queryObject).toArray();
        console.log('Questions found:', questions);
        if (!questions || questions.length === 0) {
            return res.status(404).json({ success: false, message: "Question not found" });
        }
        return res.status(200).json({ success: true, questions });
    }
    catch (error) {
        console.error('Error in getAllQuestion:', error);
        next(new error_1.CustomError(error.message));
    }
};
exports.getAllQuestion = getAllQuestion;
