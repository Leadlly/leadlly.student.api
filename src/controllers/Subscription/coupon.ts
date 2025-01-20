import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import { Coupon } from "../../models/couponModel";

export const getCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { plan, category } = req.query;

    if (!category) {
      return next(new CustomError("Pricing type (category) not provided", 400));
    }

    const query: { category: string; plan?: string } = {
      category: category as string,
    };
    if (plan) query.plan = plan as string;

    const coupons = await Coupon.find(query);

    if (coupons.length === 0) {
      return next(new CustomError("No coupon exists under this category", 404));
    }

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error(error);
    next(new CustomError((error as Error).message, 500));
  }
};

export const checkCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, plan } = req.body;

    if (!code) {
      return next(new CustomError("Coupon code not provided", 400));
    }

    const coupon = await Coupon.findOne({ code, category: "custom" });

    if (!coupon) {
      return next(new CustomError("Invalid or expired coupon code", 404));
    }

    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return next(new CustomError("This coupon has expired", 400));
    }

    if (coupon.usageLimit <= 0) {
      return next(new CustomError("Coupon usage limit has been reached", 400));
    }

    if (coupon.plan && !coupon.plan.includes(plan)) {
      return next(new CustomError("This coupon is not valid for this plan", 400));
    }

    res.status(200).json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error(error);
    next(new CustomError((error as Error).message, 500));
  }
};
