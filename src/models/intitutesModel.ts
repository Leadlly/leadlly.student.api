import mongoose from "mongoose";



const intitutesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    intituteId: {
        type: String,
        required: true,
        unique: true,
    },
    location: {
        city: {},
        state: {}
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

export const Institutes = mongoose.model("InstitutesData", intitutesSchema)