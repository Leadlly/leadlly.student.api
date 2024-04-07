import { NextFunction } from "express";
import nodemailer from "nodemailer";
import { CustomError } from "../middlewares/error";

type Options = {
  email: string;
  subject: string;
  message: string;
};
export const sendMail = async (options: Options, next: NextFunction) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};
