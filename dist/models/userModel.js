"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.Schema({
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
    address: {
        country: { type: String, default: null },
        addressLine: { type: String, default: null },
        pincode: { type: Number, default: null },
    },
    academic: {
        examName: { type: String, default: null },
        schedule: { type: String, default: null },
        coachingMode: { type: String, default: null },
        coachingName: { type: String, default: null },
        coachingAddress: { type: String, default: null },
        schoolOrCollegeName: { type: String, default: null },
        schoolOrCollegeAddress: { type: String, default: null },
    },
    about: {
        standard: Number,
        dateOfBirth: String,
        gender: { type: String, default: null },
    },
    password: { type: String, select: false, default: null },
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
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    const salt = await bcrypt_1.default.genSalt(10);
    if (!this.password)
        return;
    this.password = await bcrypt_1.default.hash(this.password, salt);
    next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt_1.default.compare(candidatePassword, this.password);
    }
    catch (error) {
        throw new Error("Error comparing password.");
    }
};
userSchema.methods.getToken = async function () {
    const resetToken = crypto_1.default.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto_1.default
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetTokenExpiry = Date.now() + 10 * 60 * 1000;
    return resetToken;
};
const User = mongoose_1.default.model("User", userSchema);
exports.default = User;
