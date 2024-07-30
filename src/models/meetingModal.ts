import mongoose, { Schema } from "mongoose";
import { IMeeting } from "../types/IMeeting";

const meetingSchema: Schema<IMeeting>  = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, 
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId
    },
    accepted: { type: Boolean, default: false},
    rescheduled: {
        isRescheduled: {type: Boolean, default: false},
        date: {
            type: Date,
        },
        time: {
            type: String, 
        }
    },
    isCompleted: { type: Boolean, default: false },
    gmeet: {
        tokens: {},
        link: {
          type: String,
          default: null,
        },
    },
    message: String,
    createdBy: {
            type: String,
            enum: ['mentor', 'student'],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
})

export const Meeting = mongoose.model<IMeeting>("Meeting", meetingSchema)