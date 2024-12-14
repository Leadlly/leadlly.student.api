import mongoose, { Schema, Document } from 'mongoose';
import IUser from '../types/IUser';

interface IToken extends Document {
  user: mongoose.Types.ObjectId | IUser; 
  push_token: string; 
  createdAt: Date
}

const tokenSchema: Schema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  push_token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Push_Token = mongoose.model<IToken>('PushToken', tokenSchema);
