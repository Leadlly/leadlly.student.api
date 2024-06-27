import mongoose, { Schema, Document } from "mongoose";
import bcrypt from 'bcrypt';

interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  newUser: {
    firstname: string;
    lastname?: string;
    email: string;
    password: string;
  };
}

const OTPSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  newUser: {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
});

// Pre-save hook for password hashing
OTPSchema.pre<IOTP>("save", async function (next) {
  if (!this.isModified("newUser.password")) return next();

  const salt = await bcrypt.genSalt(10);
  if (!this.newUser.password) return;
  this.newUser.password = await bcrypt.hash(this.newUser.password, salt);

  next();
});

const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);

export default OTPModel;
