import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { StudyData } from "../../models/studentData";
import { CustomError } from "../../middlewares/error";

export const storeBackRevisionData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { topics, tag, user, ...restBody } = req.body;

        // Check if topics is an array and not empty
        if (!Array.isArray(topics) || topics.length === 0) {
            throw new CustomError('Topics must be a non-empty array');
        }

        const createdDocuments = [];

        // Iterate over each topic and create a document if it doesn't exist
        for (let topic of topics) {
            const existingDocument = await StudyData.findOne({ topic, tag });

            if (existingDocument) {
                // If a document with the same topic and tag exists, skip the creation
                console.log(`Document with topic "${topic}" and tag "${tag}" already exists. Skipping...`);
                // return next(new CustomError(`"${topic.name}" with this "${tag}" already exists`, 400));
                continue
            }

            const data = await StudyData.create({
                ...restBody,
                topic,
                tag,
                user: new mongoose.Types.ObjectId('666a01a69461d46dc3c7b5fb') 
            });

            createdDocuments.push(data);
        }

        res.status(201).json({
            success: true,
            message: "Saved",
            data: createdDocuments
        });
    } catch (error: any) {
        next(new CustomError(error.message));
    }
};
