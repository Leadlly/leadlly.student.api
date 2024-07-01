"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateOTP = () => {
    let digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};
exports.default = generateOTP;
