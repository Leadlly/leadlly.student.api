import { NextFunction, Request, Response } from "express";
import { Push_Token } from "../../models/push_token";
import { sendPushNotification } from "../../utils/sendPushNotification";
import { CustomError } from "../../middlewares/error";

export const sendCustomNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { heading, message, action,  userId } = req.body;

    if (userId) {
      // Find the push token for a specific user
      const tokenData = await Push_Token.findOne({ user: userId });

      if (!tokenData) {
        return res.status(404).json({ success: false, message: "Push token not found for the specified user" });
      }

      // Send the notification to a single user
      await sendPushNotification([tokenData.push_token], heading, message, action);  

      return res.status(200).json({
        success: true,
        message: "Custom notification sent to the user successfully",
      });
    }

    // If no specific userId is provided, send to all users
    const tokens = await Push_Token.find();
    const pushTokens = tokens.map(tokenData => tokenData.push_token);

    if (pushTokens.length === 0) {
      return res.status(404).json({ success: false, message: "No push tokens found" });
    }

    await sendPushNotification(pushTokens, heading, message, action);

    res.status(200).json({
      success: true,
      message: "Custom notification sent to all users successfully",
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
