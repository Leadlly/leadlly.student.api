import { NextFunction, Request, Response } from "express";
import { StudyData } from "../../models/studentData";
import { CustomError } from "../../middlewares/error";
import { SubtopicsData } from "../../models/subtopics_data";
import { questions_db } from "../../db/db";
import mongoose from "mongoose";

export const storeTopics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { topics, tag, subject, chapter, createdBy, userId, ...restBody } = req.body;

    // Determine the user ID to use
    const targetUserId = req.user?._id || userId;
    
    if (!targetUserId) {
      return next(new CustomError("User ID is required", 400));
    }

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
        user: targetUserId,
      });

      if (!existingDocument) {
        const data = await StudyData.create({
          ...restBody,
          topic: {
            ...topic,
            id: topic._id,
            name: normalizedTopicName,
          },
          chapter: {
            name: chapter.name,
            id: chapter._id,
          },
          tag,
          "subject.name": subject?.toLowerCase(),
          user: targetUserId,
          createdBy: createdBy || 'student',
        });

        createdDocuments.push(data);
      } else {
        // Update the existing document with the new tag
        await StudyData.updateOne(
          { _id: existingDocument._id },
          { $set: { tag, updatedAt: new Date() } }
        );
        console.log(
          `Document with topic "${topic.name}" updated with new tag "${tag}" for user "${targetUserId}".`
        );
      }

      // Subtopics processing (this will run regardless of the above condition)
      const totalSubtopicsCount = await questions_db.collection("subtopics").countDocuments({
        topicId: topic._id,
      });

      if (
        Array.isArray(topic.subtopics) &&
        topic.subtopics.length > 0 &&
        topic.subtopics.length !== totalSubtopicsCount
      ) {
        console.log("Processing subtopics...");
        for (let subtopic of topic.subtopics) {
          const existingSubtopic = await SubtopicsData.findOne({
            "subtopic.id": subtopic._id,
            tag,
            user: targetUserId,
          });

          if (existingSubtopic) {
            console.log(
              `Subtopic "${subtopic._id}" already exists for user "${targetUserId}". Skipping...`
            );
            continue;
          }

          await SubtopicsData.create({
            user: targetUserId,
            tag,
            subtopic: {
              id: subtopic._id,
              name: subtopic.name,
            },
            topic: {
              id: topic._id,
              name: normalizedTopicName,
            },
            chapter: {
              id: chapter._id,
              name: chapter.name,
            },
            subject: {
              name: subject.toLowerCase(),
            },
            standard: restBody.standard,
            createdBy: createdBy || 'student', 
          });
        }
      }
    }

    console.log("All processing completed");
    res.status(201).json({
      success: true,
      message: "Saved",
      data: createdDocuments,
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const storeUnrevisedTopics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { chapterIds, subject, tag, standard } = req.body;

    if (!Array.isArray(chapterIds) || chapterIds.length === 0) {
      return next(new CustomError("ChapterIds either null or not an array", 400));
    }

    let data: any[] = [];
    for (let chapterId of chapterIds) {
      const chapterInfo: any = await questions_db.collection("chapters").findOne({ _id: new mongoose.Types.ObjectId(chapterId) });
      if (!chapterInfo) {
        return next(new CustomError("Chapter not found", 400));
      }

      const topicInfo: any[] = await questions_db.collection("topics").find({ chapterId: new mongoose.Types.ObjectId(chapterId) }).toArray();
      if (topicInfo.length === 0) {
        console.log(`No topics for this chapter ${chapterId}`)

        continue;
      }
      
      for (let topic of topicInfo) {
        const formattedData = {
          topic: {
            id: topic._id,
            name: topic.name,
          },
          chapter: {
            name: chapterInfo.name,
            id: chapterInfo._id,
          },
          tag,
          "subject.name": subject.toLowerCase(),
          user: req.user._id,
          standard: standard,
        };

        data.push(formattedData);
      }
    }

    const response = await StudyData.insertMany(data);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const storeSubTopics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const { subtopics, tag, subject, chapter, topic, ...restBody } = req.body;

    // Check if topics is an array and not empty
    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      throw new CustomError("Topics must be a non-empty array");
    }

    const subTopicIds = new Set();
    for (let subtopic of subtopics) {
      const normalizedSubTopicId = subtopic._id;
      if (subTopicIds.has(normalizedSubTopicId)) {
        throw new CustomError(`Duplicate topic found: "${subtopic._id}"`);
      }
      subTopicIds.add(normalizedSubTopicId);
    }

    const createdDocuments = [];

    for (let subtopic of subtopics) {
      const normalizedSubTopicId = subtopic._id;
      const existingDocument = await SubtopicsData.findOne({
        "subtopic._id": normalizedSubTopicId,
        tag,
        user: req.user._id, 
      });

      if (existingDocument) {
        console.log(
          `Document with topic "${subtopic._id}" and tag "${tag}" already exists for user "${req.user._id}". Skipping...`
        );
        continue;
      }

      const data = await SubtopicsData.create({
        ...restBody,
        subtopic: {
          ...subtopic,
          name: subtopic.name,
          id: normalizedSubTopicId,
        },
        topic: {
          id: topic._id,
          name: topic.name
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

