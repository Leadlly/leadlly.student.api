import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import razorpay from "../../services/payment/Razorpay";
import Course from "../../models/courseModel";
import User from "../../models/userModel";
import Payment from "../../models/paymentModel";
import crypto from "crypto";
import { subQueue } from "../../services/bullmq/producer";
export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { title, price, description } = req.body;

    if (!title || !price || !description) {
      return next(new CustomError("Please provide all details", 400));
    }

    const course = await Course.create({
      title,
      price,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const getAllCourses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courses = await Course.find({});
    if (!courses) return next(new CustomError("Course not found", 404));

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const getCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next(new CustomError("Course not found", 404));

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const coursePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    let finalPrice = course.price;

    if (req.query.coupon) {
      try {
        const coupon: { amountReduced: number } = JSON.parse(
          req.query.coupon as string,
        );
        if (coupon && coupon.amountReduced) {
          finalPrice = Math.max(0, course.price - coupon.amountReduced); // Ensure finalPrice is not negative
        }
      } catch (error) {
        console.error("Error parsing coupon:", error);
      }
    }

    const order = await razorpay.orders.create({
      amount: Number(finalPrice * 100),
      currency: "INR",
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError("User not found", 404)); // Ensure user exists

    const secret = process.env.RAZORPAY_API_SECRET;
    if (!secret)
      return next(new CustomError("Razorpay secret is not defined", 400));

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id, "utf-8")
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      user: user._id,
      type: "OneTime",
    });

    await subQueue.add("coursePayment", {
      options: {
        email: user.email,
        subject: "Course @Leadlly",
        message: `Congratulations! Your have successfully enrolled in our summer course. Your payment is successfull -> ${razorpay_payment_id}`,
      },
    });

    res.redirect(
      `${process.env.LANDING_PAGE_FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`,
    );
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};
