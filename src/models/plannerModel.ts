import mongoose from "mongoose";

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  day: {
    type: String,
    required: true
  },
  topics: Array
});

const plannerSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Student"
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  days: [daySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Planner = mongoose.model("Planner", plannerSchema);

export default Planner;
