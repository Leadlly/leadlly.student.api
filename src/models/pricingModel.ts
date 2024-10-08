import mongoose, { Schema, Document } from 'mongoose';

export interface IPricing extends Document {
  planId: string; 
  amount: number;
  type: 'main' | 'temporary'; 
  currency: string;
  category: 'basic' | 'pro' | 'premium' | 'free' | null;
  status: string;
  "duration(months)": number;
  createdAt: Date
}

const PricingSchema: Schema = new Schema({
  planId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: {type: String, default: "INR"},
  category: { type: String, enum: [ 'basic', 'pro', 'premium', 'free'  ]},
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
