import { NextFunction, Request, Response } from "express";
import { CustomError } from "./error";
import ApiKey from "../models/apiKeyModel";

export const checkApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const apiKey = req.headers["x-api-key"];
  
  if (!apiKey) return next(new CustomError("API key is required", 401));
  
  const keyRecord = await ApiKey.findOne({ key: apiKey, isActive: true });
  
  if (!keyRecord) return next(new CustomError("Invalid API key", 401));
  
  if (keyRecord.expiresAt < new Date()) {
    keyRecord.isActive = false;
    await keyRecord.save();
    return next(new CustomError("API key has expired", 401));
  }
  
  // API key is valid, proceed
  next();
};