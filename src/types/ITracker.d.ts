
import { Chapter, Topic } from "./IDataSchema";

  

interface IStudiedAt {
    date: Date;
    efficiency: number;
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