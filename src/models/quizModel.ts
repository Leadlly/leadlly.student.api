import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    questions: [],
    quizType: String,
    quizReport: {},
    createdAt: {
        type: Date,
        default: Date.now
    }
})

export const Quiz = mongoose.model("Quiz", quizSchema)