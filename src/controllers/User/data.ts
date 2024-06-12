import { NextFunction, Request, Response } from "express"
import { StudyData } from "../../models/studentData"
import { CustomError } from "../../middlewares/error";

export const storeBackRevisionData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Destructure topics from the request body and keep the rest of the body
        const { topics, user, ...restBody } = req.body;

        // Check if topics is an array and not empty
        if (!Array.isArray(topics) || topics.length === 0) {
            throw new CustomError('Topics must be a non-empty array');
        }

        const createdDocuments = [];

        // Iterate over each topic and create a document
        for (let topic of topics) {
            const data = await StudyData.create({
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
    } catch (error: any) {
        next(new CustomError(error.message));
    }
};