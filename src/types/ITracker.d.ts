
import { Topic } from "./IDataSchema";

  

interface IStudiedAt {
    date: Date;
    efficiency: number;
  }

  interface Chapter {
    name: string;
    plannerFrequency?: number;
    level?: string;
    overall_efficiency?: number;
    overall_progress?: number;
    total_questions_solved: { 
    number?: number;
    percentage?: number;
    };
    studiedAt: {
      date?: Date;
      efficiency?: number;
    }[];
  }

  
  // Define the main document interface
 export interface ITracker extends Document {
    user: mongoose.Schema.Types.ObjectId;
    subject: {
      name: string;
    };
    chapter: Chapter;
    topics: Topic[];
    createdAt: Date;
    updatedAt: Date;
  }