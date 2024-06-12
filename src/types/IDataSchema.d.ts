import moongoose, { Document } from "mongoose";

interface IDataSchema extends Document {
    user: mongoose.Schema.Types.ObjectId;
    tag: string;
    topic: string;
    chapter: string;
    subject: string;
    createdAt?: Date;
}