import mongoose from "mongoose";

interface IDataSchema extends mongoose.Document {
  user: mongoose.Schema.Types.ObjectId;
  tag: string;
  topic: string;
  chapter: string;
  subject: string;
  standard: number;
  createdAt?: Date;
  updatedAt?: Date;
  studiedDate?: Date;
  quizScores: number[];
  weeklyTestScore: number;
}


export default IDataSchema;
