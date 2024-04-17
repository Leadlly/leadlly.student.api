import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../middlewares/error";

type Cookie = {
  user: any;
  res: Response;
  next: NextFunction;
  message: string;
  statusCode: number;
};

const setCookie = async ({ user, res, next, message, statusCode }: Cookie) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return new CustomError("Jwt Secret not defined");

    const token = jwt.sign({ id: user._id }, secret);

    console.log(token);
    res
      .status(statusCode)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
      })
      .json({
        success: true,
        message,
      });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export default setCookie;
