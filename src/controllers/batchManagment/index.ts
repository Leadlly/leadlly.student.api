import { Request, Response, NextFunction } from "express";
import { CustomError } from "../../middlewares/error";
import User from "../../models/userModel";
import mongoose from "mongoose";
import { db } from "../../db/db";

// Request to join a batch
export const requestBatch = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      (batch) => batch._id.toString() === batchId
    );

    if (existingBatchRequest) {
      return next(
        new CustomError("Request for this batch already exists", 400)
      );
    }

    // Add new batch request
    user.batches.push({
      _id: new mongoose.Types.ObjectId(batchId),
      status: "pending",
      requestedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Batch join request sent successfully",
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Request to join a class
export const requestClass = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
      (cls) => cls._id.toString() === classId
    );

    if (existingClassRequest) {
      return next(
        new CustomError("Request for this class already exists", 400)
      );
    }

    // Add class request
    user.classes.push({
      _id: new mongoose.Types.ObjectId(classId),
      status: "pending",
      requestedAt: new Date(),
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Class join request sent successfully",
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Get all requests status
export const getRequestStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("batches._id")
      .populate("classes._id");

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      batchRequests: user.batches.map((batch) => ({
        batch: batch._id,
        status: batch.status,
        requestedAt: batch.requestedAt,
      })),
      classRequests: user.classes.map((cls) => ({
        class: cls._id,
        status: cls.status,
        requestedAt: cls.requestedAt,
      })),
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};

// Get classes by status
export const getClassesByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const status = req.query.status as string;

    // Validate status
    if (!status || !["pending", "accepted", "rejected"].includes(status)) {
      return next(
        new CustomError(
          "Invalid status. Must be 'pending', 'accepted', or 'rejected'",
          400
        )
      );
    }

    const classes = await User.aggregate([
      {
        $match: { _id: userId },
      },
      {
        $project: {
          classes: {
            $filter: {
              input: "$classes",
              as: "cls",
              cond: { $eq: ["$$cls.status", status] },
            },
          },
        },
      },
      {
        $unwind: "$classes",
      },
      {
        $lookup: {
          from: "classes",
          localField: "classes._id",
          foreignField: "_id",
          as: "classData",
        },
      },
      {
        $unwind: "$classData",
      },
      {
        $lookup: {
          from: "batches",
          localField: "classData.batch",
          foreignField: "_id",
          as: "classData.batch",
        },
      },
      {
        $lookup: {
          from: "mentors",
          localField: "classData.teacher",
          foreignField: "_id",
          as: "classData.teacher",
        },
      },
      { $unwind: "$classData.batch" },
      { $unwind: "$classData.teacher" },
      {
        $project: {
          _id: 1,
          class: {
            $mergeObjects: [
              "$classes", // includes status and requestedAt
              {
                _id: "$classData._id",
                subject: "$classData.subject",
                acceptingResponses: "$classData.acceptingResponses",
                shareCode: "$classData.shareCode",
                shareLink: "$classData.shareLink",
                batch: {
                  _id: "$classData.batch._id",
                  name: "$classData.batch.name",
                  standard: "$classData.batch.standard",
                },
                teacher: {
                  _id: "$classData.teacher._id",
                  firstname: "$classData.teacher.firstname",
                  lastname: "$classData.teacher.lastname",
                },
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          classes: { $push: "$class" },
        },
      },
    ]);

    // if (!classesData) {
    //   return next(new CustomError("User not found", 404));
    // }

    // Filter classes by the requested status
    // const filteredClasses = user[0]?.classes?.filter((cls) => cls.status === status);

    res.status(200).json({
      success: true,
      status: status,
      classes: classes[0].classes || [],
    });
  } catch (error: any) {
    console.log(error);
    next(new CustomError(error.message));
  }
};

export const getAllClasses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user._id;
    const Batch = db.collection("batches");
    const Class = db.collection("classes");
    const user = await User.findById(userId);

    if (!user) {
      return next(new CustomError("User not found", 404));
    }

    if (!user.institute?._id) {
      return next(new CustomError("Institute not found for user", 404));
    }

    // First find batches according to institute ID
    const batches = await Batch.find({
      institute: user.institute._id,
      standard: user.academic.standard.toString(),
    }).toArray();

    if (!batches || batches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No batches found for this institute",
      });
    }

    const alreadyRequestedClasses = user.classes.filter(
      (class_) => class_.status === "accepted" || class_.status === "pending"
    );

    // Find classes based on batch IDs
    const classes = await Class.aggregate([
      {
        $match: {
          _id: { $nin: alreadyRequestedClasses.map((item) => item._id) },
          batch: { $in: batches.map((batch) => batch._id) },
          acceptingResponses: true,
        },
      },
      {
        $lookup: {
          from: "batches",
          localField: "batch",
          foreignField: "_id",
          as: "batch",
        },
      },
      {
        $unwind: "$batch",
      },
      {
        $lookup: {
          from: "mentors",
          localField: "teacher",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $unwind: "$teacher",
      },
      {
        $project: {
          _id: 1,
          acceptingResponses: 1,
          classReport: 1,
          createdAt: 1,
          description: 1,
          meetingLink: 1,
          notes: 1,
          recordingLink: 1,
          resources: 1,
          shareCode: 1,
          shareLink: 1,
          subject: 1,
          updatedAt: 1,
          "batch._id": 1,
          "batch.name": 1,
          "batch.standard": 1,
          "teacher._id": 1,
          "teacher.firstname": 1,
          "teacher.lastname": 1,
        },
      },
    ]).toArray();

    res.status(200).json({
      success: true,
      classes,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};
