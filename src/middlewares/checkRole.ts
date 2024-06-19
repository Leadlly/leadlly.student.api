import { Request, Response, NextFunction } from "express";
import { CustomError } from "./error";

const checkRole = (role: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (role === "mentor" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));
    if (role === "parent" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));
    if (role === "admin" && req.user.role !== role)
      return next(new CustomError("Not Authorised", 403));

    next();
  };
};

export default checkRole;
