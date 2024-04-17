import { Request, Response, NextFunction } from "express";

export interface err extends Error {
  statusCode: number;
  message: string;
}

export class CustomError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (
  err: err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Use err.statusCode instead of statusCode
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal server error";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export default errorMiddleware;
