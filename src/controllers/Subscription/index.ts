import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import razorpay from "../../services/payment/Razorpay";
import User from "../../models/userModel";
import { subQeuue } from "../../services/bullmq/producer";
import crypto from "crypto";
import Payment from "../../models/paymentModel";

export const buySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    if (user.role === "admin" || user.role === "mentor") {
      return next(new CustomError("Subscription is only for students", 400));
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      return next(
        new CustomError(
          "RAZORPAY_PLAN_ID is not defined in the environment variables.",
          400
        )
      );
    }

    const duration = Number(req.query.duration);
  
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: duration, // Use the converted duration here
      total_count: 12,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    user.subscription.type = "1";

    // Assuming you want to save the updated user document
    await user.save();

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const verifySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError("User not found", 404)); // Ensure user exists

    const subscription_id = user?.subscription.id;

    const secret = process.env.RAZORPAY_API_SECRET;
    if (!secret)
      return next(new CustomError("Razorpay secret is not defined", 400));

    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
    }

    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      user: user._id
    });

    user.subscription.status = "active";

    await user.save();

    await subQeuue.add("subscrition", {
      options: {
        email: user.email,
        subject: "Leadlly Subscription",
        message: `Congratulations! Your one month plan is now active. Ref. no. -> ${razorpay_payment_id}`,
      },
    });

    res.redirect(
      `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const cancelSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError("User not found", 404));

    const subscriptionId = user.subscription.id;
    if (!subscriptionId || typeof subscriptionId !== "string") {
      return next(new CustomError("Subscription ID is not available", 400));
    }

    const payment = await Payment.findOne({
      razorpay_subscription_id: subscriptionId,
    });
    if (!payment) return next(new CustomError("Payment not found", 404));

    // Ensure payment.createdAt is converted to a timestamp (number) before subtraction
    const gap = Date.now() - new Date(payment.createdAt).getTime();

    const refundDays = process.env.REFUND_DAYS;
    if (!refundDays)
      return next(new CustomError("Please provide Refund Days", 404));

    const refundTime = Number(refundDays) * 24 * 60 * 60 * 1000;

    // Check if the gap is less than 7 days
    if (gap > refundTime) {
      return next(
        new CustomError("Cannot cancel subscription after 7 days.", 400)
      );
    } else {
      // Cancel the subscription goes here
      const subscription = await razorpay.subscriptions.cancel(subscriptionId);

      //Refund the amount
      const refund = await razorpay.payments.refund(
        payment.razorpay_payment_id,
        {
          speed: "normal",
        }
      );

      await payment.deleteOne();

      user.refund.status = refund.status;
      user.refund.type = refund.speed_processed;
      user.refund.subscriptionType = user.subscription.type;

      user.subscription.status = subscription.status;
      user.subscription.id = undefined;
      user.subscription.type = undefined;

      await user.save();

      await subQeuue.add("SubcriptionCancel", {
        options: {
          email: user.email,
          subject: "Leadlly Subscription",
          message: `Hello ${user.name}! Your subscription is cancelled. Refund will be processed in 5 - 7 working `,
        }
        })

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully.",
      });
    }
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};
