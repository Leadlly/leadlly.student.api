"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = void 0;
const axios_1 = __importDefault(require("axios"));
const error_1 = require("../../middlewares/error");
const userModel_1 = __importDefault(require("../../models/userModel"));
const setCookie_1 = __importDefault(require("../../utils/setCookie"));
const googleAuth = async (req, res, next) => {
    try {
        const { access_token } = req.body;
        if (!access_token)
            return next(new error_1.CustomError("No access token provided", 400));
        // Verify the access token with Google
        const tokenInfoResponse = await axios_1.default.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`);
        const userInfoResponse = await axios_1.default.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`);
        const tokenInfo = tokenInfoResponse.data;
        const userData = userInfoResponse.data;
        if (!tokenInfo || !userData)
            return next(new error_1.CustomError("Invalid token", 401));
        const { email, name } = userData;
        if (!email)
            return next(new error_1.CustomError("Email not found", 404));
        const nameArray = name.split(" ");
        const user = await userModel_1.default.findOne({ email });
        if (user) {
            // If user already exists then log in the user
            (0, setCookie_1.default)({
                user,
                res,
                next,
                message: "Login Success",
                statusCode: 200,
            });
        }
        else {
            // If user not found then create a new user
            const newUser = await userModel_1.default.create({
                firstname: nameArray[0],
                lastname: nameArray.length > 1 ? nameArray[1] : null,
                email,
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
        console.error(error);
        next(new error_1.CustomError("Authentication failed", 500));
    }
};
exports.googleAuth = googleAuth;
