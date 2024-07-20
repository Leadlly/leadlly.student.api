import { Document, ObjectId } from "mongoose";

interface IDay {
  date: Date;
  day: string;
  continuousRevisionTopics: any[];
  backRevisionTopics: any[];
  completedTopics: any[],
  incompletedTopics: any[],
  questions: { [key: string]: any };
}

interface IPlanner extends Document {
  student: ObjectId;
  startDate: Date;
  endDate: Date;
  days: IDay[];
  createdAt: Date;
}
