import mongoose from 'mongoose'

const trackerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: {},
    chapter: {
        name: {
            type: String,
            required: true,
          },
          plannerFrequency: {type: Number, default: 0},
          level: String,
          overall_efficiency: {type: Number, default: 0},
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

const Tracker = mongoose.model("Tracker", trackerSchema)

export default Tracker