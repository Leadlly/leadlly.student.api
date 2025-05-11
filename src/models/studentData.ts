import mongoose from "mongoose";
import IDataSchema from "../types/IDataSchema";

const dataSchema = new mongoose.Schema<IDataSchema>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tag: {
    type: String,
    required: true,
  },
  topic: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    plannerFrequency: {type: Number, default: 0},
    level: String,
    overall_efficiency: { type: Number, default: 0, min: 0, max: 100 },
    studiedAt: [
      {
        date: Date,
        efficiency: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
  },
  chapter: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    name: {
      type: String,
      required: true,
    },
    plannerFrequency: {type: Number, default: 0},
    level: String,
    overall_efficiency: { type: Number, default: 0, min: 0, max: 100 },
    studiedAt: [
      {
        date: Date,
        efficieny: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
  },
  subject: {
    name: {
      type: String,
      required: true
    },
    // overall_efficiency: { type: Number, default: 0, min: 0, max: 100 },
  },
  standard: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    enum: ["student", "mentor"],
    default: "student",
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

dataSchema.index({ user: 1, 'topic.name': 1 }, { unique: true });

export const StudyData = mongoose.model<IDataSchema>("StudyData", dataSchema);
