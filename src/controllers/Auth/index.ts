import { Request, Response, NextFunction } from "express";
import User from "../../models/userModel";
import { CustomError } from "../../middlewares/error";
import setCookie from "../../utils/setCookie";
import generateOTP from "../../utils/generateOTP";
import { otpQueue } from "../../services/bullmq/producer";
import crypto from "crypto";

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

    await otpQueue.add("otpVerify", {
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

    await otpQueue.add("otpVerify", {
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
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new CustomError("Email not registered", 404));

    // Use the comparePassword method here
    const isMatched = await user.comparePassword(password);
    if (!isMatched) return next(new CustomError("Wrong password", 400));

    setCookie({
      user,
      res,
      next,
      message: "Login Success",
      statusCode: 200,
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new CustomError("Email not registered", 400));

    const resetToken = await user.getToken();

    await user.save(); //saving the token in user

    const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
    await otpQueue.add("otpVerify", {
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
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const resetpassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const resetToken = req.params.token;
    if (!resetToken) return next(new CustomError("Something went wrong", 400));

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetTokenExpiry: {
        $gt: Date.now(),
      },
    });

    if (!user)
      return next(new CustomError("Your link is expired! Try again", 400));

    user.password = req.body.password;
    user.resetPasswordToken = null;
    user.resetTokenExpiry = null;

    await user.save();
    res.status(200).json({
      success: true,
      message: "You password has been changed",
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const logout = async (req: Request, res: Response) => {
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

export const getUser = async( 
  req: Request,
  res: Response,
  next: NextFunction) => {

    try {
      const user = await User.findById(req.user._id)
      if (!user)
        return next(new CustomError("User not found", 400));

      res.status(200).json({
        success: true,
        user
      });

    } catch (error: any) {
      next(new CustomError(error.message));
    }
  
}