import { NextFunction, Request, Response } from "express";
import { StudyData } from "../../models/studentData";
import { CustomError } from "../../middlewares/error";
import { SubtopicsData } from "../../models/subtopics_data";
import { questions_db } from "../../db/db";

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

      // Fetch total subtopics from QuestionDb
      const totalSubtopicsCount = await questions_db.collection("subtopics").countDocuments({
        "topicId": topic._id,
      });

      if (
        Array.isArray(topic.subtopics) &&
        topic.subtopics.length > 0 &&
        topic.subtopics.length !== totalSubtopicsCount
      ) {
        for (let subtopic of topic.subtopics) {
          const existingSubtopic = await SubtopicsData.findOne({
            "subtopic.id": subtopic._id,
            tag,
            user: req.user._id,
          });

          if (existingSubtopic) {
            console.log(
              `Subtopic "${subtopic._id}" already exists for user "${req.user._id}". Skipping...`
            );
            continue;
          }

          await SubtopicsData.create({
            user: req.user._id,
            tag,
            subtopic: {
              id: subtopic._id,
              name: subtopic.name
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
          });
        }
      }
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