// IPlanner.ts
import { Document, ObjectId } from 'mongoose';

interface ITopicDetail {
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
}

interface ITopic {
  name: string;
  additionalDetails: ITopicDetail;
}

interface IPlanner {
  student: ObjectId;
  startDate: Date;
  endDate: Date;
  days: Array<{
    day: string;
    date: Date;
    topics: ITopic[];
  }>;
  createdAt?: Date;
}

export default IPlanner;
