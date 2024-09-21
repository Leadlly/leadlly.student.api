import mongoose, { Schema, Document } from 'mongoose';

export interface IPricing extends Document {
  planId: string; 
  amount: number;
  type: 'main' | 'temporary'; 
  currency: string;
  category: string;
  status: string;
  "duration(months)": number;
}

const PricingSchema: Schema = new Schema({
  planId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: {type: String, default: "INR"},
  category: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: "active"},
  type: {
    type: String,
    enum: ['main', 'temporary'], 
    required: true,
    default: "main"
  },
  "duration(months)": Number
});

export const Pricing = mongoose.model<IPricing>('Pricing', PricingSchema);
