import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
  },
  date: String,
  day: String,
  topics: [
    {
      name: String,
      additionalDetails: {
        subject: String,
        chapter: String,
        topic: String,
        subtopic: String,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Planner = mongoose.model("Planner", plannerSchema);

export default Planner;
