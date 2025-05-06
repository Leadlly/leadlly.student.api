import { Request, Response, NextFunction } from "express";
import { CustomError } from "./error";
import IUser from "../types/IUser";

type SubscriptionCategory = "basic" | "pro" | "premium" | "free" | null;

const categoryHierarchy: SubscriptionCategory[] = [
  "basic",
  "pro",
  "premium",
  "free",
];

export const authorizeSubscriber = (
  requiredCategory?: SubscriptionCategory
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;

    if (user?.subscription?.status !== "active" && !user?.freeTrial?.active) {
      return next(
        new CustomError(
          "You don't have an active subscription or free trial",
          403
        )
      );
    }

    if (requiredCategory) {
      // const userCategoryIndex = categoryHierarchy.indexOf(user.category);
      // const requiredCategoryIndex = categoryHierarchy.indexOf(requiredCategory);
      // if (userCategoryIndex < requiredCategoryIndex) {
      //   return next(new CustomError(`This feature requires a ${requiredCategory} subscription or higher`, 403));
      // }
    }
    next();
  };
};
