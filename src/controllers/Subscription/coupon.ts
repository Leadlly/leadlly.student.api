import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import { Coupon } from "../../models/couponModel";

export const getCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan, category } = req.query; 

    if (!category) {
      return next(new CustomError("Pricing type (category) not provided", 400));
    }

    const query: { category: string; plan?: string } = { category: category as string };
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
