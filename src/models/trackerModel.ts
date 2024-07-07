import mongoose from 'mongoose'

const trackerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: String,
    chapter: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    topics: Array
})

const Tracker = mongoose.model("Tracker", trackerSchema)

export default Tracker