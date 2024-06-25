"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.logout = exports.resetpassword = exports.forgotPassword = exports.login = exports.otpVerification = exports.resentOtp = exports.register = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const error_1 = require("../../middlewares/error");
const setCookie_1 = __importDefault(require("../../utils/setCookie"));
const generateOTP_1 = __importDefault(require("../../utils/generateOTP"));
const producer_1 = require("../../services/bullmq/producer");
const crypto_1 = __importDefault(require("crypto"));
let OTP, newUser;
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (user)
            return next(new error_1.CustomError("User already exists", 400));
        OTP = (0, generateOTP_1.default)();
        await producer_1.otpQueue.add("otpVerify", {
            options: {
                email,
                subject: "Verification",
                message: `You verification otp for registration is ${OTP}`,
            },
        });
        const nameArray = name.split(" ");
        newUser = new userModel_1.default({
            firstname: nameArray[0],
            lastname: nameArray.length > 1 ? nameArray[1] : null,
            password,
        });
        res.status(200).json({
            success: true,
            message: `Verfication OTP send to ${email}`,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.register = register;
const resentOtp = async (req, res, next) => {
    try {
        OTP = "";
        OTP = (0, generateOTP_1.default)();
        await producer_1.otpQueue.add("otpVerify", {
            options: {
                email: newUser.email,
                subject: "Verification",
                message: `You verification otp for registration is ${OTP}`,
            },
        });
        res.status(200).json({
            success: true,
            message: `Otp resend success on ${newUser.email}`,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.resentOtp = resentOtp;
const otpVerification = async (req, res, next) => {
    try {
        const { otp } = req.body;
        if (otp !== OTP)
            return next(new error_1.CustomError("Wrong Otp", 400));
        await newUser.save();
        (0, setCookie_1.default)({
            user: newUser,
            res,
            next,
            message: "Verification Sucess",
            statusCode: 200,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.otpVerification = otpVerification;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.default.findOne({ email }).select("+password");
        if (!user)
            return next(new error_1.CustomError("Email not registered", 404));
        // Use the comparePassword method here
        const isMatched = await user.comparePassword(password);
        if (!isMatched)
            return next(new error_1.CustomError("Wrong password", 400));
        (0, setCookie_1.default)({
            user,
            res,
            next,
            message: "Login Success",
            statusCode: 200,
        });
    }
    catch (error) {
        console.log(error);
        next(new error_1.CustomError(error.message));
    }
};
exports.login = login;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await userModel_1.default.findOne({ email });
        if (!user)
            return next(new error_1.CustomError("Email not registered", 400));
        const resetToken = await user.getToken();
        await user.save(); //saving the token in user
        const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
        await producer_1.otpQueue.add("otpVerify", {
            options: {
                email: email,
                subject: "Password Reset",
                message: `You reset password link is here ${url}`,
            },
        });
        res.status(200).json({
            success: true,
            message: `Reset password link sent to ${email}`,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.forgotPassword = forgotPassword;
const resetpassword = async (req, res, next) => {
    try {
        const resetToken = req.params.token;
        if (!resetToken)
            return next(new error_1.CustomError("Something went wrong", 400));
        const resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        const user = await userModel_1.default.findOne({
            resetPasswordToken,
            resetTokenExpiry: {
                $gt: Date.now(),
            },
        });
        if (!user)
            return next(new error_1.CustomError("Your link is expired! Try again", 400));
        user.password = req.body.password;
        user.resetPasswordToken = null;
        user.resetTokenExpiry = null;
        await user.save();
        res.status(200).json({
            success: true,
            message: "You password has been changed",
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.resetpassword = resetpassword;
const logout = async (req, res) => {
    res
        .status(200)
        .cookie("token", null, {
        expires: new Date(Date.now()),
    })
        .json({
        success: true,
        message: "Logged out",
    });
};
exports.logout = logout;
const getUser = async (req, res, next) => {
    try {
        const user = await userModel_1.default.findById(req.user._id);
        if (!user)
            return next(new error_1.CustomError("User not found", 400));
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.getUser = getUser;
