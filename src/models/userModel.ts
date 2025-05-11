import mongoose, { Schema } from "mongoose";
import IUser from "../types/IUser";
import crypto from "crypto";
import moment from "moment-timezone";
import { intitutesSchema } from "./intitutesModel";

const userSchema = new Schema<IUser>({
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
  category: { type: String, default: "free" },
  phone: {
    personal: { type: Number, default: null },
    other: { type: Number, default: null },
  },
  parent: {
    name: { type: String, default: null },
    phone: { type: Number, default: null },
  },
  mentor: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  institute: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    name: { type: String, default: null },
    logo: {
      key: { type: String, default: null },
      url: { type: String, default: null },
    },
  },
  batches: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  classes: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
      status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending",
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  planner: { type: Boolean, default: false },
  preferences: {
    continuousData: { nextDay: { type: Boolean, default: true } }, // to decide continousTopics will come same day or next day
    dailyQuestions: { type: Number, default: 3 }, // for no. of questions in todo list
    backRevisionTopics: { type: Number, default: 3 }, // no. of back revision topics in planner
  },
  address: {
    country: { type: String, default: null },
    addressLine: { type: String, default: null },
    pincode: { type: Number, default: null },
  },
  academic: {
    standard: { type: Number, default: null },
    competitiveExam: { type: String, default: null },
    subjects: [
      {
        name: { type: String, default: null },
        overall_efficiency: { type: Number, default: 0, min: 0, max: 100 },
        overall_progress: { type: Number, default: 0, min: 0, max: 100 },
        total_questions_solved: {
          number: { type: Number, default: 0 },
          percentage: { type: Number, default: 0, min: 0, max: 100 },
        },
      },
    ],
    schedule: { type: String, default: null },
    coachingMode: { type: String, default: null },
    coachingName: intitutesSchema,
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
    level: {
      number: { type: Number, default: 1 },
    },
    points: {
      number: { type: Number, default: 0 },
    },
    streak: {
      number: { type: Number, default: 0 },
      updatedAt: { type: Date },
    },
    mood: [
      {
        day: {
          type: String,
          enum: [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        date: { type: String, default: null },
        emoji: { type: String, default: null },
      },
    ],
    report: {
      dailyReport: {
        date: {
          type: Date,
          default: moment.tz("Asia/Kolkata").startOf("day").toDate(),
        },
        session: { type: Number, default: 0, min: 0, max: 100 },
        quiz: { type: Number, default: 0, min: 0, max: 100 },
        overall: { type: Number, default: 0, min: 0, max: 100 },
      },
    },
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
    planId: { type: String },
    duration: { type: Number },
    dateOfActivation: { type: Date, default: null },
    dateOfDeactivation: { type: Date, default: null },
    coupon: { type: String, default: null },

    upgradation: {
      previousPlanId: { type: String, default: null },
      previousDuration: { type: Number, default: null },
      dateOfUpgradation: { type: Date, default: null },
      addedDuration: { type: Number, default: null },
    },
  },
  freeTrial: {
    availed: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    dateOfActivation: { type: Date, default: null },
    dateOfDeactivation: { type: Date, default: null },
  },
  refund: {
    subscriptionType: { type: String, default: null },
    status: { type: String, default: null },
    amount: { type: Number, default: null },
  },
  resetPasswordToken: { type: String, default: null },
  resetTokenExpiry: { type: String, default: null },
  disabled: { type: Boolean, default: false }, // If disabled is true then the student will not be assigned an mentor (for test accounts only)

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

// Prepopulate mood field for new users
userSchema.pre("save", function (next) {
  if (this.isNew) {
    // If it's a new user, initialize the mood field for seven days
    this.details.mood = [
      { day: "Sunday", date: null, emoji: null },
      { day: "Monday", date: null, emoji: null },
      { day: "Tuesday", date: null, emoji: null },
      { day: "Wednesday", date: null, emoji: null },
      { day: "Thursday", date: null, emoji: null },
      { day: "Friday", date: null, emoji: null },
      { day: "Saturday", date: null, emoji: null },
    ];
  }
  next();
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
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
        }
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
