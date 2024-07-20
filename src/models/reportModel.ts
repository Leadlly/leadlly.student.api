import mongoose from "mongoose";
import {IStudentReport} from '../types/IStudnetReport'

const reportSchema = new mongoose.Schema<IStudentReport>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    day: String,
    date: Date,
    session: { type: Number, default: 0, min: 0, max: 100 },      
    quiz: { type: Number, default: 0, min: 0, max: 100 },      
    overall: { type: Number, default: 0, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

})

export const StudentReport = mongoose.model<IStudentReport>("StudentReport", reportSchema)