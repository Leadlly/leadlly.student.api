"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = void 0;
const error_1 = require("../middlewares/error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const setCookie_1 = __importDefault(require("../utils/setCookie"));
const googleAuth = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data)
            return next(new error_1.CustomError("No data from body", 404));
        // Decode the JWT
        const userData = jsonwebtoken_1.default.decode(data.credential);
        if (!userData)
            return next(new error_1.CustomError("Credential not found", 404));
        const user = await userModel_1.default.findOne({ email: userData.email });
        if (user) {
            //if user already exists then login the user
            (0, setCookie_1.default)({
                user,
                res,
                next,
                message: "Login Success",
                statusCode: 200,
            });
        }
        else {
            //if user not found then create a new user
            const newUser = await userModel_1.default.create({
                name: userData.name,
                email: userData.email,
            });
            (0, setCookie_1.default)({
                user: newUser,
                res,
                next,
                message: "Registered successfully",
                statusCode: 201,
            });
        }
    }
    catch (error) {
        console.log(error);
    }
};
exports.googleAuth = googleAuth;
