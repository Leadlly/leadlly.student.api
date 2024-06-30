import { NextFunction, Request, Response } from "express";
import { StudyData } from "../../models/studentData";
import { CustomError } from "../../middlewares/error";

export const storeBackRevisionData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { topics, tag, user, ...restBody } = req.body;

    // Check if topics is an array and not empty
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new CustomError("Topics must be a non-empty array");
    }

    const topicNames = new Set();
    for (let topic of topics) {
      if (topicNames.has(topic.name)) {
        throw new CustomError(`Duplicate topic found: "${topic.name}"`);
      }
      topicNames.add(topic.name);
    }

    const createdDocuments = [];

    for (let topic of topics) {
      const existingDocument = await StudyData.findOne({
        "topic.name": topic.name,
        tag,
      });

      if (existingDocument) {
        // If a document with the same topic and tag exists, skip the creation
        console.log(
          `Document with topic "${topic}" and tag "${tag}" already exists. Skipping...`,
        );
        // return next(new CustomError(`"${topic.name}" with this "${tag}" already exists`, 400));
        continue;
      }

      const data = await StudyData.create({
        ...restBody,
        topic,
        tag,
        user: req.user._id,
      });

      createdDocuments.push(data);
    }

    res.status(201).json({
      success: true,
      message: "Saved",
      data: createdDocuments,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};
