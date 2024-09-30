import mongoose, { Document, Types } from "mongoose";

export interface IQuiz extends Document {
  user: Types.ObjectId;
  questions: Record<string, Types.ObjectId[]>;
  quizType: string;
  attempted: boolean;
  reattempted: number;
  report?: Types.ObjectId;
  endDate: Date;
  createdAt: Date;
}

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: {
    type: Object,
    required: true,
  },
  quizType: {
    type: String,
    required: true,
  },
  attempted: {
    type: Boolean,
    default: false,
  },
  reattempted: {
    type: Number,
    default: 0,
  },
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz_Report",
  },
  endDate: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);
