import { NextFunction, Request, Response } from "express";
import { CustomError } from "./error";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";
import ApiKey from "../models/apiKeyModel";

declare global {
  namespace Express {
    interface Request {
      user?: any; 
      isServerRequest?: boolean;
    }
  }
}
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"];
  
  if (apiKey) {
    const keyRecord = await ApiKey.findOne({ key: apiKey, isActive: true });
    
    if (!keyRecord) return next(new CustomError("Invalid API key", 401));
    
    if (keyRecord.expiresAt < new Date()) {
      keyRecord.isActive = false;
      await keyRecord.save();
      return next(new CustomError("API key has expired", 401));
    }
    
    // API key is valid, mark request as server-to-server
    req.isServerRequest = true;
    return next();
  }
  
  // No API key, check for cookie auth
  const { token } = req.cookies;
  if (!token) return next(new CustomError("Authentication required", 401));

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new CustomError("JWT Secret not defined", 400));

  const decoded = jwt.verify(token, secret) as JwtPayload;
  req.user = await User.findById(decoded.id);

  next();
};

