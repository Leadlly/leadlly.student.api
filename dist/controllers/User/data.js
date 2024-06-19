"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeBackRevisionData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const studentData_1 = require("../../models/studentData");
const error_1 = require("../../middlewares/error");
const storeBackRevisionData = async (req, res, next) => {
  try {
    const { topics, tag, user, ...restBody } = req.body;
    // Check if topics is an array and not empty
    if (!Array.isArray(topics) || topics.length === 0) {
      throw new error_1.CustomError("Topics must be a non-empty array");
    }
    const createdDocuments = [];
    // Iterate over each topic and create a document if it doesn't exist
    for (let topic of topics) {
      const existingDocument = await studentData_1.StudyData.findOne({
        topic,
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
        user: new mongoose_1.default.Types.ObjectId("666a01a69461d46dc3c7b5fb"),
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
