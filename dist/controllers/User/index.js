"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentPersonalInfo = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const studentPersonalInfo = async (req, res) => {
    try {
        const { name, class: studentClass, phone, parent, address, examName, schedule, school, coachingMode, coachingName, } = req.body;
        console.log("rwq", req.body);
        console.log("parent", parent);
        console.log("parent", address);
        console.log("parent", examName);
        console.log("parent", schedule);
        console.log("parent", school);
        console.log("parent", coachingMode);
        // Ensure req.user exists and has _id
        const userId = req.user ? req.user._id : null;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = name;
        user.about = user.about || {};
        user.about.standard = studentClass;
        user.phone = phone || user.phone;
        user.parent = {
            parentName: parent,
            parentPhone: parent,
        };
        user.address = {
            country: address?.country,
            address: address?.address,
            pincode: address?.pincode,
        };
        user.academic = {
            examName: examName,
            schedule: schedule,
            school: school,
            coachingMode: coachingMode,
            coachingName: coachingName,
        };
        await user.save();
        res.status(200).json({
            message: "Personal information updated successfully",
            user
        });
    }
    catch (error) {
        console.error("Error updating personal info:", error);
        res.status(500).json({ message: "Server error", error });
    }
};
exports.studentPersonalInfo = studentPersonalInfo;
