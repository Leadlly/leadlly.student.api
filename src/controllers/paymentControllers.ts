import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import razorpay from "../services/payment/Razorpay";
import User from "../models/userModel";
import { subQeuue } from "../services/bullmq/producer";

export const buySubscription = async(req: Request, res: Response, next: NextFunction) =>{
       try {

        const user = await User.findById(req.user._id)

        if(!user) {
            return next(new CustomError("User not found", 404));
        }

        if(user.role === 'admin' || user.role === "mentor"){
            return next(new CustomError("Subscription is only for students", 400))
        }
       
        const planId = process.env.RAZORPAY_PLAN_ID;
        if (!planId) {
            return next(new CustomError("RAZORPAY_PLAN_ID is not defined in the environment variables.", 400));
        }

        console.log("hello")
        const duration = Number(req.query.duration);
        console.log(duration) 

        const subscription = await razorpay.subscriptions.create({
            plan_id: planId, 
            customer_notify: 1,
            quantity: duration, // Use the converted duration here
            total_count: 12,
          })

         user.subscription.id = subscription.id;
         user.subscription.status = subscription.status;
         user.subscription.category = '1';

        // Assuming you want to save the updated user document
        await user.save();

        await subQeuue.add("subscrition", {
            options: {
              email: req.user.email,
              subject: "Leadlly Subscription",
              message: `Congratulations! Your one month plan is now active. ID -> ${subscription.id}`,
            },
          });

        res.status(200).json({
            success: true,
            subscription
        })
       } catch (error: any) {
        next(new CustomError(error.message, 500))
       }
}
