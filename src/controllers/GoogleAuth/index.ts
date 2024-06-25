import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { CustomError } from "../../middlewares/error";
import User from "../../models/userModel";
import setCookie from "../../utils/setCookie";

export const googleAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { access_token } = req.body;
    if (!access_token)
      return next(new CustomError("No access token provided", 400));

    // Verify the access token with Google
    const tokenInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`,
    );
    const userInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`,
    );

    const tokenInfo = tokenInfoResponse.data;
    const userData = userInfoResponse.data;

    if (!tokenInfo || !userData)
      return next(new CustomError("Invalid token", 401));

    const { email, name } = userData;

    if (!email) return next(new CustomError("Email not found", 404));
    const nameArray = name.split(" ");
    const user = await User.findOne({ email });
    if (user) {
      // If user already exists then log in the user
      setCookie({
        user,
        res,
        next,
        message: "Login Success",
        statusCode: 200,
      });
    } else {
      // If user not found then create a new user
      const newUser = await User.create({
        firstname: nameArray[0],
        lastname: nameArray.length > 1 ? nameArray[1] : null,
        email,
      });

      setCookie({
        user: newUser,
        res,
        next,
        message: "Registered successfully",
        statusCode: 201,
      });
    }
  } catch (error) {
    console.error(error);
    next(new CustomError("Authentication failed", 500));
  }
};
