import mongoose from "mongoose";

export interface Institute {
    name: string;
    intituteId: string;
    type: string;
    location: {},
    createdAt: Date,
    updatedAt: Date
}

export const intitutesSchema = new mongoose.Schema<Institute>({
    name: {
        type: String,
        required: true
    },
    type: {
       type: String,
    //    required: true
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

export const Institutes = mongoose.model<Institute>("InstitutesData", intitutesSchema)