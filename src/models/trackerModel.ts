import mongoose, { Schema } from 'mongoose';
import { ITracker } from '../types/ITracker';
import { Topic } from '../types/IDataSchema';

// Define the Topic schema
const topicSchema = new mongoose.Schema<Topic>({
  id: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
  },
  name: {
    type: String,
    required: true,
  },
  plannerFrequency: { type: Number, default: 0 },
  level: String,
  overall_efficiency: { type: Number, default: 0, min: 0, max: 100 },
  studiedAt: [
    {
      date: Date,
      efficiency: { type: Number, default: 0, min: 0, max: 100 },
    },
  ],
});

// Define the Tracker schema
const trackerSchema: Schema = new mongoose.Schema<ITracker>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    name: { type: String },
  },
  chapter: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true
    },
    name: {
      type: String,
      required: true,
    },
    plannerFrequency: { type: Number, default: 0 },
    level: String,
    overall_efficiency: { type: Number, default: 0, min: 0, max: 100 },
    overall_progress: { type: Number, default: 0, min: 0, max: 100 },
    total_questions_solved: {
      number: { type: Number, default: 0 },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    studiedAt: [
      {
        date: Date,
        efficiency: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
  },
  topics: [topicSchema], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a unique index for the user and chapter name
trackerSchema.index({ user: 1, 'chapter.name': 1 }, { unique: true });

// Create and export the Tracker model
const Tracker = mongoose.model<ITracker>('Tracker', trackerSchema);

export default Tracker;
