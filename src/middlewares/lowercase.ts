import { Request, Response, NextFunction } from "express";

const convertToLowercase = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const convertToLowerCase = (obj: any): void => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].trim().toLowerCase();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        convertToLowerCase(obj[key]);
      }
    }
  };

  if (req.body) {
    convertToLowerCase(req.body);
  }

  if (req.query) {
    convertToLowerCase(req.query);
  }

  next();
};

export default convertToLowercase;
