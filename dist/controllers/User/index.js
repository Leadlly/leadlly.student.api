"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentPersonalInfo = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const studentPersonalInfo = async (req, res) => {
    try {
        const { name, class: studentClass, phone, parentName, parentPhone, country, address, pincode, examName, schedule, school, coachingMode, coachingName, } = req.body;
        const userId = req.user._id;
        // Check if user exists
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update the user's personal and academic information
        user.name = name;
        user.about = user.about || {};
        user.about.standard = studentClass;
        user.phone = user.phone || {};
        user.phone.personal = phone.personal;
        user.phone.other = phone.other;
        user.parentName = parentName;
        user.parentPhone = parentPhone;
        user.country = country;
        user.address = address;
        user.pincode = pincode;
        user.academic = user.academic || {};
        user.academic.examName = examName;
        user.academic.schedule = schedule;
        user.academic.school = school;
        user.academic.coachingMode = coachingMode;
        user.academic.coachingName = coachingName;
        // Save the updated user to the database
        await user.save();
        // Return a success response
        res.status(200).json({ message: "Personal information updated successfully", user });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.studentPersonalInfo = studentPersonalInfo;
