import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";
import setCookie from "../utils/setCookie";

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    if (!data) return next(new CustomError("No data from body", 404));

    // Decode the JWT 
    const userData = jwt.decode(data.credential) as JwtPayload;
    if (!userData) return next(new CustomError("Credential not found", 404));

    const user = await User.findOne({ email: userData.email });
    if (user) return next(new CustomError("User already exists", 400));

    const newUser = await User.create({
      name: userData.name,
      email: userData.email,
    });

    setCookie({
      user: newUser,
      res,
      next,
      message: "Verification Sucess",
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
  }
};
