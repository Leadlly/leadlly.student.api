import mongoose from "mongoose";

export interface ITopicDetails {
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
}

export interface ITopic {
  name: string;
  additionalDetails: ITopicDetails;
}

export interface IDay {
  date: Date;
  day: string;
  topics: ITopic[];
}

export interface IPlanner extends mongoose.Document {
  student: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: IDay[];
  createdAt?: Date;
}
