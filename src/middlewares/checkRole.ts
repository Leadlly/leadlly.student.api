import { Request, Response, NextFunction } from "express";
import { CustomError } from "./error";

const checkRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (role === "admin" && req.user.role !== role) return next(new CustomError('Not Authorised', 403))
    if (role === "superAdmin" && req.user.role !== role) return next(new CustomError('Not Authorised', 403))
  };
}

export default checkRole