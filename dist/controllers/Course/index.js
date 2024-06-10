"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.coursePayment = exports.getCourse = exports.getAllCourses = exports.createCourse = void 0;
const error_1 = require("../../middlewares/error");
const Razorpay_1 = __importDefault(require("../../services/payment/Razorpay"));
const courseModel_1 = __importDefault(require("../../models/courseModel"));
const userModel_1 = __importDefault(require("../../models/userModel"));
const paymentModel_1 = __importDefault(require("../../models/paymentModel"));
const crypto_1 = __importDefault(require("crypto"));
const producer_1 = require("../../services/bullmq/producer");
const createCourse = async (req, res, next) => {
    try {
        const { title, price, description } = req.body;
        if (!title || !price || !description) {
            return next(new error_1.CustomError("Please provide all details", 400));
        }
        const course = await courseModel_1.default.create({
            title,
            price,
            description,
        });
        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message, 500));
    }
};
exports.createCourse = createCourse;
const getAllCourses = async (req, res, next) => {
    try {
        const courses = await courseModel_1.default.find({});
        if (!courses)
            return next(new error_1.CustomError("Course not found", 404));
        res.status(200).json({
            success: true,
            courses,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message, 500));
    }
};
exports.getAllCourses = getAllCourses;
const getCourse = async (req, res, next) => {
    try {
        const course = await courseModel_1.default.findById(req.params.id);
        if (!course)
            return next(new error_1.CustomError("Course not found", 404));
        res.status(201).json({
            message: "Course created successfully",
            course,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message, 500));
    }
};
exports.getCourse = getCourse;
const coursePayment = async (req, res, next) => {
    try {
        const course = await courseModel_1.default.findById(req.params.id);
        if (!course) {
            return res.status(400).json({
                success: false,
                message: "Course not found",
            });
        }
        let finalPrice = course.price;
        if (req.query.coupon) {
            try {
                const coupon = JSON.parse(req.query.coupon);
                if (coupon && coupon.amountReduced) {
                    finalPrice = Math.max(0, course.price - coupon.amountReduced); // Ensure finalPrice is not negative
                }
            }
            catch (error) {
                console.error("Error parsing coupon:", error);
            }
        }
        const order = await Razorpay_1.default.orders.create({
            amount: Number(finalPrice * 100),
            currency: "INR",
        });
        res.status(200).json({
            success: true,
            order,
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message, 500));
    }
};
exports.coursePayment = coursePayment;
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, } = req.body;
        const user = await userModel_1.default.findById(req.user._id);
        if (!user)
            return next(new error_1.CustomError("User not found", 404)); // Ensure user exists
        const secret = process.env.RAZORPAY_API_SECRET;
        if (!secret)
            return next(new error_1.CustomError("Razorpay secret is not defined", 400));
        const generated_signature = crypto_1.default
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id, "utf-8")
            .digest("hex");
        if (generated_signature !== razorpay_signature) {
            return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);
        }
        await paymentModel_1.default.create({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            user: user._id,
            type: "OneTime"
        });
        await producer_1.subQeuue.add("coursePayment", {
            options: {
                email: user.email,
                subject: "Course @Leadlly",
                message: `Congratulations! Your have successfully enrolled in our summer course. Your payment is successfull -> ${razorpay_payment_id}`,
            },
        });
        res.redirect(`${process.env.LANDING_PAGE_FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`);
    }
    catch (error) {
        next(new error_1.CustomError(error.message, 500));
    }
};
exports.verifyPayment = verifyPayment;
