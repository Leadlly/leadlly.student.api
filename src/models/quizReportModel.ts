import mongoose from "mongoose";

interface ITopicReport {
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  totalMarks: number;
  efficiency: number; 
}

export interface ISubjectWiseReport {
  efficiency: number; 
  topics: {
    [topic: string]: ITopicReport; // Report for each topic within the subject
  };
}

interface IQuizReport {
  user: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  totalMarks: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  maxScore: number;
  overallEfficiency: number; 
  subjectWiseReport: {
    [subject: string]: ISubjectWiseReport; 
  };
  timeTaken: number;
  questions: mongoose.Types.ObjectId[]; 
  updatedAt?: Date;
  createdAt?: Date; 
}

const TopicReportSchema = new mongoose.Schema<ITopicReport>({
  totalQuestions: { type: Number, required: true },
  correct: { type: Number, required: true },
  incorrect: { type: Number, required: true },
  unattempted: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  efficiency: { type: Number, default: 0, min: 0, max: 100 }, 
});

const SubjectWiseReportSchema = new mongoose.Schema<ISubjectWiseReport>({
  efficiency: { type: Number, default: 0, min: 0, max: 100 }, 
  topics: {
    type: Map,
    of: TopicReportSchema, 
  },
});

const reportSchema = new mongoose.Schema<IQuizReport>({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
  totalMarks: { type: Number, required: true },
  correctCount: { type: Number, required: true },
  incorrectCount: { type: Number, required: true },
  unattemptedCount: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  overallEfficiency: { type: Number, default: 0, min: 0, max: 100 }, 
  subjectWiseReport: {
    type: Map,
    of: SubjectWiseReportSchema, 
  },
  timeTaken: { type: Number},
  questions: [{ type: mongoose.Schema.Types.ObjectId }],  
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

reportSchema.index({ user: 1, quizId: 1 }, { unique: true });

const Quiz_Report = mongoose.model<IQuizReport>("QuizReport", reportSchema);
export default Quiz_Report;
