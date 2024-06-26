import { Document } from "mongoose";

interface IDay {
  date: Date;
  day: string;
  continuousRevisionTopics: any[];
  backRevisionTopics: any[];
  questions: any[];
}

interface IPlanner extends Document {
  student: mongoose.Schema.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  days: IDay[];
  createdAt: Date;
}
