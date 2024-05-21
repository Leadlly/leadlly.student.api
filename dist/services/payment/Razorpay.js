"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpay_1 = __importDefault(require("razorpay"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const key_id = process.env.RAZORPAY_API_KEY;
const key_secret = process.env.RAZORPAY_API_SECRET;
if (!key_id || !key_secret) {
    throw new Error("Razorpay API key or secret is missing");
}
const razorpay = new razorpay_1.default({
    key_id: key_id,
    key_secret: key_secret,
});
exports.default = razorpay;
