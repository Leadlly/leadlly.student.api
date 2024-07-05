import { Options } from "./sendMail";

export const getTemplate = (options: Options) => {
    switch (options.tag) {
      case "otp":
        return `
          <div style="font-family: Arial, sans-serif;">
            <h3>Your Verification Code </h3>
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
      default:
        return options.message; 
    }
  };
  