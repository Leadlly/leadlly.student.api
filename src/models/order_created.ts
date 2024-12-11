import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  order_id: string;
  planId: string;
  duration: number;
  category: string;
  title: string;
  coupon?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  order_id: { type: String, required: true },
  planId: { type: String },
  duration: { type: Number },
  title: {type: String},
  category: { type: String },
  coupon: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
