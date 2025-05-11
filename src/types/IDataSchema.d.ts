import mongoose from "mongoose";

interface Topic {
  id: mongoose.Types.ObjectId;
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
  id: mongoose.Types.ObjectId;
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
  createdBy?: 'mentor' | 'student';
  createdAt?: Date;
  updatedAt?: Date;
  efficiency?: any;
  quizScores?: number[];
  weeklyTestScore?: number;
}


export interface ISubtopicsData extends Document {
  _id: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId;
  tag: string;
  subtopic: {
    id?: Types.ObjectId;
    name: string;
    plannerFrequency?: number;
    level?: string;
    overall_efficiency?: number;
    studiedAt?: IStudiedAt[];
  };
  topic: {
    id?: Types.ObjectId;
    name: string;
  };
  chapter: {
    id?: Types.ObjectId;
    name: string;
  };
  subject: {
    name: string;
  };
  standard: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export { Topic, Chapter, Subject, ISubtopicsData };
export default IDataSchema;
