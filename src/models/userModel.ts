import mongoose, { Schema } from "mongoose";
import IUser from "../types/IUser";
import crypto from "crypto";

const userSchema = new Schema({
  firstname: {
    type: String,
    required: [true, "Please enter your name"],
    default: null,
  },
  lastname: {
    type: String,
    default: null,
  },
  email: { type: String, required: true, unique: true, default: null },

  phone: {
    personal: { type: Number, default: null },
    other: { type: Number, default: null },
  },
  parent: {
    name: { type: String, default: null },
    phone: { type: Number, default: null },
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  planner:{ type: Boolean, default: false},
  address: {
    country: { type: String, default: null },
    addressLine: { type: String, default: null },
    pincode: { type: Number, default: null },
  },
  academic: {
    standard: { type: Number, default: null },
    competitiveExam: { type: String, default: null },
    subjects: { type: Array, default: null },
    schedule: { type: String, default: null },
    coachingMode: { type: String, default: null },
    coachingName: { type: String, default: null },
    coachingAddress: { type: String, default: null },
    schoolOrCollegeName: { type: String, default: null },
    schoolOrCollegeAddress: { type: String, default: null },
  },
  about: {
    dateOfBirth: { type: String, default: null },
    gender: { type: String, default: null },
  },
  password: { type: String, select: false, default: null },
  salt: { type: String, default: null },
  avatar: {
    public_id: { type: String, default: null },
    url: { type: String, default: null },
  },
  details: {
    level: { type: Number, default: null },
    points: { type: Number, default: null },
    streak: { type: Number, default: null },
    mood: [
      {
        day: { type: String, default: null },
        emoji: { type: String, default: null },
      },
    ],
  },
  badges: [
    {
      name: { type: String, default: "Beginner" },
      url: { type: String, default: "default_url" },
    },
  ],
  subscription: {
    id: { type: String, default: null },
    status: { type: String, default: null },
    dateOfActivation: { type: Date, default: null },
    freeTrialAvailed: { type: Boolean, default: false },
  },
  refund: {
    subscriptionType: { type: String, default: null },
    status: { type: String, default: null },
    amount: { type: Number, default: null },
  },
  quiz: {
    daily: { type: Array, default: [] },
    weekly: { type: Array, default: [] },
    monthly: { type: Array, default: [] },
    QOTD: { type: Array, default: [] },
    others: { type: Array, default: [] },
  },
  resetPasswordToken: { type: String, default: null },
  resetTokenExpiry: { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Pre-save hook for email validation
userSchema.pre("save", function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error("Please enter a valid email address"));
  }
  next();
});

// Pre-save hook for password hashing
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   const salt = await bcrypt.genSalt(10);
//   if (!this.password) return;
//   this.password = await bcrypt.hash(this.password, salt);

//   next();
// });

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  try {
    const hashedPassword = await new Promise((resolve, reject) => {
      crypto.pbkdf2(
        candidatePassword,
        this.salt,
        1000,
        64,
        "sha512",
        (err, derivedKey) => {
          if (err) reject(err);
          resolve(derivedKey.toString("hex"));
        },
      );
    });

    return hashedPassword === this.password;
  } catch (error) {
    throw new Error("Error comparing password.");
  }
};

userSchema.methods.getToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiry = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
