import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";
import { promisify } from "util";

const pbkdf2Async = promisify(crypto.pbkdf2);

interface IOTP extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  newUser: {
    firstname: string;
    lastname?: string;
    email: string;
    password: string;
    salt?: string;
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
    salt: {
      type: String,
    },
  },
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook for password hashing
OTPSchema.pre<IOTP>("save", async function (next) {
  if (!this.isModified("newUser.password")) return next();

  try {
    const salt = crypto.randomBytes(16).toString("hex");
    this.newUser.salt = salt;

    const derivedKey = await pbkdf2Async(
      this.newUser.password,
      salt,
      1000,
      64,
      "sha512",
    );
    this.newUser.password = derivedKey.toString("hex");

    next();
  } catch (err: any) {
    next(err);
  }
});

const OTPModel = mongoose.model<IOTP>("OTP", OTPSchema);

export default OTPModel;
