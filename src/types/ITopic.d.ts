// ITopic.ts
import { Document, ObjectId } from 'mongoose';

interface ITopicDetail {
  subject: string;
  chapter: string;
  topic: string;
  subtopic: string;
}

interface ITopic extends Document {
  student: ObjectId;
  tag: string;
  name: string;
  additionalDetails: ITopicDetail;
}

export default ITopic;
