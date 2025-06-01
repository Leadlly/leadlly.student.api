import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import { Pricing } from "../../models/pricingModel";

export const getPricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pricingType } = req.query;

    if (!pricingType) {
      return next(new CustomError("Pricing type not provided", 400));
    }

    const pricing = await Pricing.find({
      category: pricingType as string,
      exam: req.user.academic.competitiveExam,
    });

    if (!pricing || pricing.length === 0) {
      return next(new CustomError("No pricing exists for this type", 404));
    }

    res.status(200).json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message, 500));
  }
};

export const getPricingByPlanId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { planId } = req.params;

    if (!planId) {
      return next(new CustomError("Plan ID not provided", 400));
    }

    const pricing = await Pricing.findOne({ planId });

    if (!pricing) {
      return next(new CustomError("No pricing exists for this plan ID", 404));
    }

    res.status(200).json({
      success: true,
      pricing,
    });
  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message, 500));
  }
};
