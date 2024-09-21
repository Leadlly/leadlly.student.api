import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../middlewares/error";
import { Push_Token } from "../../models/push_token";

export const savePushToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pushToken } = req.body;
        
        if (!pushToken) {
            return next(new CustomError("Push token is required", 400));
        }

        if (!req.user || !req.user._id) {
            return next(new CustomError("User not authenticated", 401));
        }

        const token = await Push_Token.findOne({ user: req.user._id });

        if (token) {
            token.push_token = pushToken;
            await token.save();
            res.status(200).json({
                success: true,
                message: "Push token updated successfully"
            });
        } else {
            await Push_Token.create({
                user: req.user._id,
                push_token: pushToken
            });
            res.status(201).json({
                success: true,
                message: "Push token created successfully"
            });
        }
    } catch (error) {
        next(new CustomError((error as Error).message, 500)); 
    }
};
