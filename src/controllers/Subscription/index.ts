import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import razorpay from "../../services/payment/Razorpay";
import User from "../../models/userModel";
import { subQueue } from "../../services/bullmq/producer";
import crypto from "crypto";
import Payment from "../../models/paymentModel";
import { Options } from "../../utils/sendMail";
import { IPricing, Pricing } from "../../models/pricingModel";
import { Coupon } from "../../models/couponModel";
import { Order } from "../../models/order_created";

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

    const planId = req.query.planId as string;
    const pricing = await Pricing.findOne({ planId }) as IPricing;

    if (!pricing) {
      return next(new CustomError("Invalid plan duration selected", 400));
    }

    let amount = pricing.amount * 100; // Convert amount to paise
    const couponCode = req.query.coupon as string;

    // Handle coupon discount 
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) {
        return next(new CustomError("Invalid coupon code", 400));
      }

      if (coupon.expiryDate && coupon.expiryDate < new Date()) {
        return next(new CustomError("Coupon has expired", 400));
      }

      if (coupon.usageLimit && coupon.usageLimit <= 0) {
        return next(new CustomError("Coupon usage limit reached", 400));
      }

      if (coupon.discountType === "percentage") {
        amount -= (amount * coupon.discountValue) / 100;
      } else {
        amount -= coupon.discountValue;
      }

      // Update coupon usage limit
      if (coupon.usageLimit) {
        coupon.usageLimit -= 1;
        await coupon.save();
      }
    }

    // Create Razorpay order
    const subscription = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: crypto.randomBytes(16).toString("hex"),
      payment_capture: true,
    });

    const order = await Order.findOne({user: user._id})
    if(order) {
      order.user = user._id,
      order.order_id= subscription.id,
      order.planId= planId,
      order.duration= pricing["duration(months)"],
      order.coupon= couponCode,

      await order.save();
      } else {
        await Order.create({
          user: user._id,
          order_id: subscription.id,
          planId: planId,
          duration: pricing["duration(months)"],
          coupon: couponCode,
        })
      }

 
    if(user.subscription.status === "active") {
      user.subscription.status = "active"
    } else {

      user.subscription.status = "pending";
    }
    await user.save();

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message, 500));
  }
};

export const verifySubscription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const { appRedirectURI } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) return next(new CustomError("User not found", 404));

    const order = await Order.findOne({ user: user._id });
    if (!order) return next(new CustomError("Order not found", 404));
    

    const order_id = order?.order_id;

    const secret = process.env.RAZORPAY_API_SECRET;
    if (!secret)
      return next(new CustomError("Razorpay secret is not defined", 400));

    // Verify Razorpay signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(order_id + "|" + razorpay_payment_id, "utf-8")
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return appRedirectURI
        ? res.redirect(`${appRedirectURI}?payment=failed`)
        : res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
    }

    // Save payment info
    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id: razorpay_order_id,
      razorpay_signature,
      user: user._id,
      planId: user.subscription?.planId,
      coupon: user.subscription?.coupon,
    });

    const pricing = await Pricing.findOne({ planId: order?.planId }) as IPricing;

    if (!pricing) {
      return next(new CustomError("Invalid plan duration selected", 400));
    }

    const currentDeactivationDate = user.subscription.dateOfDeactivation;
    const durationInMonths = pricing["duration(months)"]

    console.log(user.subscription.status, "hello")
    if (user.subscription.status === "active") {
      // Handle subscription extension on upgrade
      console.log("hello hi")
      user.subscription.upgradation = {
        previousPlanId: user.subscription.planId,
        previousDuration: user.subscription.duration,
        dateOfUpgradation: new Date(),
        addedDuration: durationInMonths, 
      };

      // Update the subscription duration
      user.subscription.duration += durationInMonths;
      user.subscription.id = order?.order_id;
      user.subscription.planId = order?.planId;
      user.subscription.coupon = order?.coupon;

        const addedDuration = durationInMonths || 0;
        if (currentDeactivationDate) {
          const newDeactivationDate = new Date(currentDeactivationDate);
          newDeactivationDate.setMonth(newDeactivationDate.getMonth() + addedDuration);
          user.subscription.dateOfDeactivation = newDeactivationDate;
      }
    } else {
      // New subscription
      console.log("hello bye")

      user.subscription.status = "active";
      user.subscription.id = order?.order_id;
      user.subscription.planId = order?.planId;
      user.subscription.duration = durationInMonths;
      user.subscription.coupon = order?.coupon;
      user.subscription.dateOfActivation = new Date();

      const newDeactivationDate = new Date();
      newDeactivationDate.setMonth(newDeactivationDate.getMonth() + durationInMonths);
      user.subscription.dateOfDeactivation = newDeactivationDate;
    }

    await user.save();

    // Send confirmation email
    await subQueue.add("payment_success", {
      options: {
        email: user.email,
        subject: "Leadlly Payment Success",
        message: `Your payment for the plan is successful.`,
        username: user.firstname,
        dashboardLink: `${process.env.FRONTEND_URL}`,
        tag: "payment_success",
      } as Options,
    });

    res.redirect(
      appRedirectURI
        ? `${appRedirectURI}?payment=success&reference=${razorpay_payment_id}`
        : `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
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
      // const subscription = await razorpay.subscriptions.cancel(subscriptionId);

      // //Refund the amount
      // const refund = await razorpay.payments.refund(
      //   payment.razorpay_payment_id,
      //   {
      //     speed: "normal",
      //   }
      // );

      // await payment.deleteOne();

      // user.refund.status = refund.status;
      // user.refund.type = refund.speed_processed;
      // user.refund.subscriptionType = user.subscription.planId;

      // user.subscription.status = subscription.status;
      // user.subscription.id = undefined;
      // user.subscription.planId = undefined;

      // await user.save();

      await subQueue.add("SubcriptionCancel", {
        options: {
          email: user.email,
          subject: "Leadlly Subscription",
          message: `Hello ${user.firstname}! Your refund request is send to our team. You can will get call in 3 - 4 working days`,
        },
      });

      res.status(200).json({
        success: true,
        message: "Subscription Cancel Request successfully.",
      });
    }
  } catch (error: any) {
    next(new CustomError(error.message, 500));
  }
};

export const getFreeTrialActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.freeTrial.active = true;
    user.freeTrial.dateOfActivation = new Date();
    user.freeTrial.availed = true;

     // Calculate the deactivation date (7 days from now)
     user.freeTrial.dateOfDeactivation = new Date(user.freeTrial.dateOfActivation);
     user.freeTrial.dateOfDeactivation.setDate(user.freeTrial.dateOfDeactivation.getDate() + 7);

    await user.save();

    await subQueue.add("freetrial", {
      options: {
        email: user.email,
        subject: "Leadlly Free-Trial",
        message: "Free-Trail",
        username: user.firstname,
        dashboardLink: `${process.env.FRONTEND_URL}`,
        tag: "subscription_active",
      } as Options,
    });

    return res
      .status(200)
      .json({ message: "Free trial activated successfully", user });
  } catch (error) {
    next(error);
  }
};
