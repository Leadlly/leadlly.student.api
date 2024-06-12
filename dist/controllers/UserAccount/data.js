"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeBackRevisionData = void 0;
const studentData_1 = require("../../models/studentData");
const error_1 = require("../../middlewares/error");
const storeBackRevisionData = async (req, res, next) => {
    try {
        const body = req.body;
        const data = await studentData_1.DataSchema.create({
            ...body,
            user: req.user._id
        });
        res.status(201).json({
            success: true,
            message: "Saved",
            data
        });
    }
    catch (error) {
        next(new error_1.CustomError(error.message));
        throw error;
    }
};
exports.storeBackRevisionData = storeBackRevisionData;
