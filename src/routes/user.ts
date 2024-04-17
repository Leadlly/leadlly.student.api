import express from "express";
import {
  login,
  logout,
  otpVerification,
  register,
  resentOtp,
} from "../controllers/user";

const router = express.Router();

router.post("/register", register);
router.post("/verify", otpVerification);
router.get("/resend", resentOtp);
router.post("/login", login);
router.get("/logout", logout);

export default router;
