"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const router = express_1.default.Router();
router.post("/register", user_1.register);
router.post("/verify", user_1.otpVerification);
router.post("/resend", user_1.resentOtp);
router.post("/login", user_1.login);
router.get("/logout", user_1.logout);
router.post("/forgetpassword", user_1.forgotPassword);
router.post("/resetpassword/:token", user_1.resetpassword);
exports.default = router;
