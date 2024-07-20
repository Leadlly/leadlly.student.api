import { Document, Schema, model } from "mongoose";
  export interface IStudentReport extends Document {
    user: Schema.Types.ObjectId;
    day: string;
    date: Date;
    session: number;
    quiz: number;
    overall: number;
    createdAt: Date;
    updatedAt: Date;
  }