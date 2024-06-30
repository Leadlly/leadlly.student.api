"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeBackRevisionData = void 0;
const studentData_1 = require("../../models/studentData");
const error_1 = require("../../middlewares/error");
const storeBackRevisionData = async (req, res, next) => {
  try {
    const { topics, tag, user, ...restBody } = req.body;
    // Check if topics is an array and not empty
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new error_1.CustomError("Topics must be a non-empty array");
    }
    const topicNames = new Set();
    for (let topic of topics) {
      if (topicNames.has(topic.name)) {
        throw new error_1.CustomError(`Duplicate topic found: "${topic.name}"`);
      }
      topicNames.add(topic.name);
    }
    const createdDocuments = [];
    for (let topic of topics) {
      const existingDocument = await studentData_1.StudyData.findOne({
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
      const data = await studentData_1.StudyData.create({
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
  } catch (error) {
    next(new error_1.CustomError(error.message));
  }
};
exports.storeBackRevisionData = storeBackRevisionData;
