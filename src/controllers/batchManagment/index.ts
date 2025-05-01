import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import User from "../../models/userModel";
import mongoose from "mongoose";

// Request to join a batch
export const requestBatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { batchId } = req.body;
        const userId = req.user._id;

        if (!batchId) {
            return next(new CustomError("Batch ID is required", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError("User not found", 404));
        }

        // Check if user already has a request for this batch
        const existingBatchRequest = user.batches.find(
            batch => batch._id.toString() === batchId
        );

        if (existingBatchRequest) {
            return next(new CustomError("Request for this batch already exists", 400));
        }

        // Add new batch request
        user.batches.push({
            _id: new mongoose.Types.ObjectId(batchId),
            status: 'pending',
            requestedAt: new Date()
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "Batch join request sent successfully"
        });

    } catch (error: any) {
        next(new CustomError(error.message));
    }
};

// Request to join a class
export const requestClass = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { classId } = req.body;
        const userId = req.user._id;

        if (!classId) {
            return next(new CustomError("Class ID is required", 400));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new CustomError("User not found", 404));
        }

        // Check if class request already exists
        const existingClassRequest = user.classes.find(
            cls => cls._id.toString() === classId
        );

        if (existingClassRequest) {
            return next(new CustomError("Request for this class already exists", 400));
        }

        // Add class request
        user.classes.push({
            _id: new mongoose.Types.ObjectId(classId),
            status: 'pending',
            requestedAt: new Date()
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "Class join request sent successfully"
        });

    } catch (error: any) {
        next(new CustomError(error.message));
    }
};

// Get all requests status
export const getRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId)
            .populate('batches._id')
            .populate('classes._id');

        if (!user) {
            return next(new CustomError("User not found", 404));
        }

        res.status(200).json({
            success: true,
            batchRequests: user.batches.map(batch => ({
                batch: batch._id,
                status: batch.status,
                requestedAt: batch.requestedAt
            })),
            classRequests: user.classes.map(cls => ({
                class: cls._id,
                status: cls.status,
                requestedAt: cls.requestedAt
            }))
        });

    } catch (error: any) {
        next(new CustomError(error.message));
    }
};

// Get classes by status
export const getClassesByStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user._id;
        const status = req.query.status as string ;

        // Validate status
        if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
            return next(new CustomError("Invalid status. Must be 'pending', 'accepted', or 'rejected'", 400));
        }

        const user = await User.findById(userId)
            .populate('classes._id');

        if (!user) {
            return next(new CustomError("User not found", 404));
        }

        // Filter classes by the requested status
        const filteredClasses = user.classes.filter(cls => cls.status === status);

        res.status(200).json({
            success: true,
            status: status,
            classes: filteredClasses.map(cls => ({
                class: cls._id,
                joinedAt: cls.requestedAt
            }))
        });

    } catch (error: any) {
        next(new CustomError(error.message));
    }
};

