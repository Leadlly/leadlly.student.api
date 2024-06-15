import mongoose from "mongoose";
import IDataSchema from "../types/IDataSchema";

const dataSchema = new mongoose.Schema<IDataSchema>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tag: {
        type: String,
        required: true
    },
    topic: {
        name: {
            type: String,
            required: true
        },
        level: String,
        efficiency: Number
    },
    chapter: {
        name: {
            type: String,
            required: true
        },
        level: String,
    },
    subject: {
        type: String,
        required: true
    },
    standard: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

export const StudyData = mongoose.model<IDataSchema>('StudyData', dataSchema);
