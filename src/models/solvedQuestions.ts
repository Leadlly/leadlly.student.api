import mongoose, { Document, Schema } from "mongoose";

interface ISolvedQuestion extends Document {
  student: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  studentAnswer: any;
  isCorrect: boolean;
  tag?: string;
  quizId: mongoose.Types.ObjectId;
  timeTaken?: number;
  createdAt: Date;
}

const questionSchema: Schema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'questionbanks',
    required: true
  },
  studentAnswer: {
    type: Schema.Types.Mixed,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  tag: {
    type: String
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
  timeTaken: { type: Number},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// unique index on the combination of student and question
questionSchema.index({ student: 1, question: 1 }, { unique: true });

const SolvedQuestions = mongoose.model<ISolvedQuestion>("SolvedQuestions", questionSchema);

export default SolvedQuestions;
export { ISolvedQuestion };
