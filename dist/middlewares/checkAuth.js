"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authoriseSubscriber = exports.checkAuth = void 0;
const error_1 = require("./error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const checkAuth = async (req, res, next) => {
    const { token } = req.cookies;
    if (!token)
        return next(new error_1.CustomError("Login First", 400));
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return next(new error_1.CustomError("Jwt Secret not defined", 400));
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    req.user = await userModel_1.default.findById(decoded.id);
    next();
};
exports.checkAuth = checkAuth;
const authoriseSubscriber = async (req, res, next) => {
    if (req.user.subscripiton.status !== "active")
        return next(new error_1.CustomError("You are not subscribed", 400));
    next();
};
exports.authoriseSubscriber = authoriseSubscriber;
