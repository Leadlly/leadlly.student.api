import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    tag: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    chapter: {
        type: String,
        required: true
    },
    subject: {
        type: String,
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

export const StudyData = mongoose.model("StudyData", dataSchema)