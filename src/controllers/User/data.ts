import { NextFunction, Request, Response } from "express";
import { StudyData } from "../../models/studentData";
import { CustomError } from "../../middlewares/error";

export const storeUnrevisedTopics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { topics, tag, subject, chapter, ...restBody } = req.body;

    // Check if topics is an array and not empty
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new CustomError("Topics must be a non-empty array");
    }

    const topicNames = new Set();
    for (let topic of topics) {
      const normalizedTopicName = topic.name.toLowerCase();
      if (topicNames.has(normalizedTopicName)) {
        throw new CustomError(`Duplicate topic found: "${topic.name}"`);
      }
      topicNames.add(normalizedTopicName);
    }

    const createdDocuments = [];

    for (let topic of topics) {
      const normalizedTopicName = topic.name.toLowerCase();
      const existingDocument = await StudyData.findOne({
        "topic.name": normalizedTopicName,
        tag,
        user: req.user._id, 
      });

      if (existingDocument) {
        console.log(
          `Document with topic "${topic.name}" and tag "${tag}" already exists for user "${req.user._id}". Skipping...`
        );
        continue;
      }

      const data = await StudyData.create({
        ...restBody,
        topic: {
          ...topic,
          id: topic._id,
          name: normalizedTopicName
        },
        chapter: {
          name: chapter.name,
          id: chapter._id
        },
        tag,
        "subject.name": subject.toLowerCase(),
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

export const getUnrevisedTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await StudyData.find({
      user: req.user._id,
      tag: { $in: ["unrevised_topic", "active_unrevised_topic"] }
    });

    res.status(200).json({
      success: true,
      data
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const deleteUnrevisedTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterName } = req.body;

    const deleteResult = await StudyData.deleteMany({
      user: req.user._id,
      "chapter.name": chapterName.toLowerCase()
    });

    if (deleteResult.deletedCount === 0) {
      return next(new CustomError("Failed to delete topics", 500));
    }

    res.status(200).json({
      success: true,
      message: "Chapter deleted",
      deletedCount: deleteResult.deletedCount
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};