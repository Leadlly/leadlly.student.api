import mongoose, { Schema, Document } from 'mongoose';

interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: Date;
  usageLimit: number;
  category: 'Listed' | 'Custom' | 'TeamMember';
  createdAt?: Date;
  plan: string
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true },
  category: {
    type: String,
    enum: ['listed', 'custom', 'team', 'special'],  
    required: true
  },
  plan: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
