import mongoose from "mongoose";
import { ISubtopicsData } from "../types/IDataSchema";

const subtopicDataSchema = new mongoose.Schema<ISubtopicsData>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tag: {
    type: String,
    required: true,
  },
  subtopic: {
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
  topic: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    name: {
      type: String,
      required: true,
    }
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
  },
  subject: {
    name: {
      type: String,
      required: true
    },
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

subtopicDataSchema.index({ user: 1, 'subtopic.name': 1 }, { unique: true });

export const SubtopicsData = mongoose.model<ISubtopicsData>("SubtopicsData", subtopicDataSchema);
