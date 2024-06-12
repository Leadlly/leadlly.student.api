"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeBackRevisionData = void 0;
const studentData_1 = require("../../models/studentData");
const error_1 = require("../../middlewares/error");
const storeBackRevisionData = async (req, res, next) => {
    try {
        // Destructure topics from the request body and keep the rest of the body
        const { topics, user, ...restBody } = req.body;
        // Check if topics is an array and not empty
        if (!Array.isArray(topics) || topics.length === 0) {
            throw new error_1.CustomError('Topics must be a non-empty array');
        }
        const createdDocuments = [];
        // Iterate over each topic and create a document
        for (let topic of topics) {
            const data = await studentData_1.StudyData.create({
                ...restBody,
                topic,
                user: user
            });
            createdDocuments.push(data);
        }
        res.status(201).json({
            success: true,
            message: "Saved",
            data: createdDocuments
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.storeBackRevisionData = storeBackRevisionData;
