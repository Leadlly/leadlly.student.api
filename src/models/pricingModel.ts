import mongoose, { Schema, Document } from 'mongoose';

export interface IPricing extends Document {
  planId: string; 
  amount: number;
  type: 'main' | 'temporary'; 
  currency: string;
  title: string;
  category: string;
  status: string;
  "duration(months)": number;
  exam: [];
  createdAt: Date
}

const PricingSchema: Schema = new Schema({
  planId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: {type: String, default: "INR"},
  title: {type: String, default: "general"},
  category: { type: String },
  exam: Array,
  status: { type: String, enum: ['active', 'inactive'], default: "active"},
  type: {
    type: String,
    enum: ['main', 'temporary'], 
    required: true,
    default: "main"
  },
  "duration(months)": Number,
  createdAt: { type: Date, default: Date.now },
});

export const Pricing = mongoose.model<IPricing>('Pricing', PricingSchema);
