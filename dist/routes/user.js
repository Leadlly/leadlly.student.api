"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../controllers/User");
const router = express_1.default.Router();
router.post("/register", User_1.register);
router.post("/verify", User_1.otpVerification);
router.post("/resend", User_1.resentOtp);
router.post("/login", User_1.login);
router.get("/logout", User_1.logout);
router.post("/forgetpassword", User_1.forgotPassword);
router.post("/resetpassword/:token", User_1.resetpassword);
exports.default = router;
