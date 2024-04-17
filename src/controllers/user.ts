import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import { CustomError } from "../middlewares/error";
import setCookie from "../utils/setCookie";
import generateOTP from "../utils/generateOTP";
import { myQueue } from "../services/bullmq/producer";

let OTP: string, newUser: any;
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) return next(new CustomError("User already exists", 400));

    OTP = generateOTP();

    await myQueue.add("otpVerify", {
      options: {
        email,
        subject: "Verification",
        message: `You verification otp for registration is ${OTP}`,
      },
    });

    newUser = new User({
      name: name,
      email: email,
      password,
    });

    res.status(200).json({
      success: true,
      message: `Verfication OTP send to ${email}`,
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const resentOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    OTP = "";
    OTP = generateOTP();

    await myQueue.add("otpVerify", {
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
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const otpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { otp } = req.body;

    if (otp !== OTP) return next(new CustomError("Wrong Otp", 400));

    await newUser.save();
    setCookie({
      user: newUser,
      res,
      next,
      message: "Verification Sucess",
      statusCode: 200,
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};
