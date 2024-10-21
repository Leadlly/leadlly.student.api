import { Options } from "./sendMail";

export const getTemplate = (options: Options) => {
  switch (options.tag) {
    case "otp":
      return `
        <div style="font-family: Arial, sans-serif;">
          <h3>Your Verification Code</h3>
          <p style="font-size: 24px; font-weight: bold; color: #9652f4;">${options.message}</p>
          <p>Please use this OTP to complete your verification.</p>
        </div>
      `;
    case "password_reset":
      return `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2 style="color: #9652f4;">Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${options.message}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #9652f4; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `;
    case "subscription_active":
      return `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <img src="https://avatars.githubusercontent.com/u/157880099?s=400&u=506807b28d88bfb69b9edf53fd830400a9446230&v=4" alt="Company Logo" style="width: 80px; margin-bottom: 20px; border-radius: 10px">
          <h2 style="color: #9652f4;">${options.message}</h2>
          <p>Dear ${options.username},</p>
          <p>Your subscription is now active. Enjoy all the benefits of our service.</p>
          <a href="${options.dashboardLink}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #9652f4; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
          <p style="margin-top: 20px;">If you have any questions, feel free to <a href="mailto:support@leadlly.in" style="color: #9652f4;">contact us</a>.</p>
          <p>Thank you for choosing our service!</p>
        </div>
      `;
    default:
      return options.message;
  }
};
