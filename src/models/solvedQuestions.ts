import mongoose, { Schema } from "mongoose";

const questionSchema: Schema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  question: {},
  studentAnswer: {},
  isCorrect: Boolean,
  tag: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SolvedQuestions = mongoose.model("SolvedQuestions", questionSchema);

export default SolvedQuestions;
