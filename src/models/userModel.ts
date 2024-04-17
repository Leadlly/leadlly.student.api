import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userModel = new Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    personal: {
      type: Number,
      // required: true,
      unique: true,
    },
    other: Number,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  about: {
    standard: Number,
    school: String,
    dob: String,
  },
  role: {
    type: String,
    enum: ["user", "mentor", "parent", "admin"],
    default: "user",
  },
  badges: [
    {
      name: {
        type: String,
        default: "Beginner",
      },
      url: {
        type: String,
        default: "default_url",
      },
    },
  ],
  payment: {},
  quiz: {
    minor: [],
    major: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook for email validation
userModel.pre("save", function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error("Please enter a valid email address"));
  }
  next();
});

// Pre-save hook for password hashing
userModel.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

const User = mongoose.model("User", userModel);

export default User;
