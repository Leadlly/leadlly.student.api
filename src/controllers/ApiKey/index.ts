import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import ApiKey from "../../models/apiKeyModel";
import { generateApiKey } from "../../utils/generateApiKey";

export const createApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, expiryDays = 365 } = req.body;
    
    if (!name) return next(new CustomError("API key name is required", 400));
    
    const key = generateApiKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);
    
    const apiKey = await ApiKey.create({
      key,
      name,
      expiresAt,
    });
    
    res.status(201).json({
      success: true,
      message: "API key created",
      apiKey: {
        key: apiKey.key,
        name: apiKey.name,
        expiresAt: apiKey.expiresAt
      }
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const listApiKeys = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKeys = await ApiKey.find().select("-key");
    
    res.status(200).json({
      success: true,
      apiKeys
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

export const revokeApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const apiKey = await ApiKey.findById(id);
    if (!apiKey) return next(new CustomError("API key not found", 404));
    
    apiKey.isActive = false;
    await apiKey.save();
    
    res.status(200).json({
      success: true,
      message: "API key revoked successfully"
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};