import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate: Date;
  usageLimit: number;
  category: 'Listed' | 'Custom' | 'TeamMember';
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  plan: string[];
}

const CouponSchema: Schema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: "percentage", required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number, required: true },
  category: {
    type: String,
    enum: ['listed', 'custom', 'team', 'special', 'referral'],  
    required: true
  },
  plan: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt:{
    type: Date, 
    default: Date.now
 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null},
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
