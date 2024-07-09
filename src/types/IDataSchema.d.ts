import mongoose from "mongoose";

interface Topic {
  name: string;
  plannerFrequency?: number;
  level?: string;
  overall_efficiency?: number;
  studiedAt: {
    date?: Date;
    efficiency?: number;
  }[];
}

interface Chapter {
  name: string;
  plannerFrequency?: number;
  level?: string;
  overall_efficiency?: number;
  studiedAt: {
    date?: Date;
    efficiency?: number;
  }[];
}

interface Subject {
  name: string;
  overall_efficiency?: number
}



interface IDataSchema extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  tag: string;
  topic: Topic;
  chapter: Chapter;
  subject: Subject;
  standard: number;
  createdAt?: Date;
  updatedAt?: Date;
  efficiency?: any;
  quizScores?: number[];
  weeklyTestScore?: number;
}

export { Topic, Chapter };
export default IDataSchema;
