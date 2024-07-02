"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../middlewares/error");
const setCookie = async ({ user, res, next, message, statusCode }) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret)
            return next(new error_1.CustomError("Jwt Secret not defined", 400));
        const token = jsonwebtoken_1.default.sign({ id: user._id }, secret);
        res
            .status(statusCode)
            .cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            sameSite: "none",
            secure: true,
        })
            .json({
            success: true,
            message,
            token,
            user
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
    }
};
exports.default = setCookie;
