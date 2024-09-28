import mongoose, { Schema } from 'mongoose'
import { ITracker } from '../types/ITracker';


const trackerSchema: Schema = new mongoose.Schema<ITracker>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: {
      name: String
    },
    chapter: {
        name: {
            type: String,
            required: true,
          },
          plannerFrequency: {type: Number, default: 0},
          level: String,
          overall_efficiency: {type: Number, default: 0, min: 0, max: 100 },
          overall_progress: { type: Number, default: 0, min: 0, max: 100 },
          total_questions_solved: { 
            number: { type: Number, default: 0 },
            percentage: { type: Number, default: 0, min: 0, max: 100 },
          }, 
          studiedAt: [
            {
              date: Date,
              efficieny: {type: Number, default: 0},
            },
          ],
    },
    topics: Array,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

trackerSchema.index({ user: 1, 'chapter.name': 1 }, { unique: true });

const Tracker = mongoose.model<ITracker>("Tracker", trackerSchema)

export default Tracker