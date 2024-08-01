import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  questions: {},
  quizType: String,
  attempted: {
    type: Boolean,
    default: false,
  },
  reattempted: {
    type: Number,
    default: 0,
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

export const Quiz = mongoose.model("Quiz", quizSchema);
