"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudyData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dataSchema = new mongoose_1.default.Schema({
  user: {
    type: mongoose_1.default.Schema.Types.ObjectId,
    ref: "User",
  },
  tag: {
    type: String,
    required: true,
  },
  topic: {
    name: {
      type: String,
      required: true,
    },
    level: String,
    overall_efficiency: Number,
    studiedAt: [
      {
        date: Date,
        efficieny: Number,
      },
    ],
  },
  chapter: {
    name: {
      type: String,
      required: true,
    },
    level: String,
    overall_efficiency: Number,
    studiedAt: [
      {
        date: Date,
        efficieny: Number,
      },
    ],
  },
  subject: {
    type: String,
    required: true,
    overall_efficiency: Number,
  },
  standard: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
exports.StudyData = mongoose_1.default.model("StudyData", dataSchema);
