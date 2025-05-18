import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import { Coupon } from "../../models/couponModel";

export const generateReferCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ReferralCode, expiredBy, update } = req.body;

    // Check if user already has a referral code
    const existingReferralCode = await Coupon.findOne({ createdBy: req.user._id });
    
    // If code exists and update flag is not provided, return the existing code
    if (existingReferralCode && !update) {
      return res.status(400).json({
        success: false,
        message: "Referral code already exists for this user",
        referralCode: existingReferralCode,
      });
    }

    let code, expiryDate;
    if (ReferralCode) {
      code = ReferralCode;
    } else {
      code = "LEAD" + Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    if (expiryDate) {
      expiryDate = new Date(expiredBy);
    } else {
      expiryDate = new Date("9999-12-31T23:59:59.999Z"); // Set to a far future date effectively making it infinite
    }

    if (update) {
      const updatedReferralCode = await Coupon.findOneAndUpdate(
        {
          createdBy: req.user._id,
        },
        {
          code: code,
          expiryDate,
          discountType: "percentage",
          discountValue: 10,
          usageLimit: 999999,
          category: "referral",
          updatedAt: new Date(),
        },
        { new: true } // Return the updated document
      );

      res.status(200).json({
        success: true,
        message: "Referral code updated successfully",
        updatedReferralCode,
      });

      return;
    }
    
    // Create new referral code if one doesn't exist
    const referralCode = await Coupon.create({
      code,
      createdBy: req.user._id,
      expiryDate,
      discountType: "percentage",
      discountValue: 10,
      usageLimit: 999999,
      category: "referral",
    });

    res.status(201).json({
      success: true,
      message: "Referral code generated successfully",
      referralCode,
    });
  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message));
  }
};

export const getReferralCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const referralCode = await Coupon.findOne({ createdBy: req.user._id });
    res.status(200).json({
      success: true,
      message: "Referral code fetched successfully",
      referralCode,
    });
  } catch (error) {
    console.log(error);
    next(new CustomError((error as Error).message));
  }
};



