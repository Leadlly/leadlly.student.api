import mongoose, { Schema, Document } from 'mongoose';

interface ICoupon extends Document {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate?: Date;
  usageLimit?: number;
}

const CouponSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date },
  usageLimit: { type: Number },
});

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
