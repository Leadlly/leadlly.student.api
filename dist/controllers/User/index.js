"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTodaysVibe = exports.studentPersonalInfo = void 0;
const userModel_1 = __importDefault(require("../../models/userModel"));
const user_schema_1 = require("../../Schemas/user.schema");
const getSubjectList_1 = require("../../utils/getSubjectList");
const studentPersonalInfo = async (req, res) => {
  try {
    const bodyData = req.body;
    const user = await userModel_1.default.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (bodyData.firstName) {
      user.firstname = bodyData.firstName;
    }
    if (bodyData.lastName) {
      user.lastname = bodyData.lastName;
    }
    if (bodyData.dateOfBirth) {
      user.about.dateOfBirth = bodyData.dateOfBirth;
    }
    if (bodyData.phone) {
      user.phone.personal = bodyData.phone;
    }
    if (bodyData.gender) {
      user.about.gender = bodyData.gender;
    }
    if (bodyData.parentName) {
      user.parent.name = bodyData.parentName;
    }
    if (bodyData.parentsPhone) {
      user.parent.phone = bodyData.parentsPhone;
    }
    if (bodyData.address) {
      user.address.addressLine = bodyData.address;
    }
    if (bodyData.pinCode) {
      user.address.pincode = bodyData.pinCode;
    }
    if (bodyData.country) {
      user.address.country = bodyData.country;
    }
    if (bodyData.class) {
      user.academic.standard = bodyData.class;
    }
    if (bodyData.competitiveExam) {
      user.academic.competitiveExam = bodyData.competitiveExam;
      user.academic.subjects = (0, getSubjectList_1.getSubjectList)(
        bodyData.competitiveExam,
      );
    }
    if (bodyData.studentSchedule) {
      user.academic.schedule = bodyData.studentSchedule;
    }
    if (bodyData.schoolOrCollegeName) {
      user.academic.schoolOrCollegeName = bodyData.schoolOrCollegeName;
    }
    if (bodyData.schoolOrCollegeAddress) {
      user.academic.schoolOrCollegeAddress = bodyData.schoolOrCollegeAddress;
    }
    if (bodyData.coachingType) {
      user.academic.coachingMode = bodyData.coachingType;
    }
    if (bodyData.coachingName) {
      user.academic.coachingName = bodyData.coachingName;
    }
    if (bodyData.coachingAddress) {
      user.academic.coachingAddress = bodyData.coachingAddress;
    }
    await user.save();
    res.status(200).json({
      message: "Personal information updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating personal info:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
exports.studentPersonalInfo = studentPersonalInfo;
const setTodaysVibe = async (req, res) => {
  const parsedResult = user_schema_1.todaysVibeSchema.safeParse(req.body);
  if (!parsedResult.success) {
    return res.status(400).json({ message: "Invalid TodaysVibe value" });
  }
  const { todaysVibe } = parsedResult.data;
  const user = await userModel_1.default.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const today = new Date().toISOString().split("T")[0];
  if (!user.details) {
    user.details = { mood: [] };
  }
  if (!user.details.mood) {
    user.details.mood = [];
  }
  const todaysMoodIndex = user.details.mood.findIndex(
    (moodEntry) => moodEntry.day === today,
  );
  if (todaysMoodIndex >= 0) {
    user.details.mood[todaysMoodIndex].emoji = todaysVibe;
  } else {
    user.details.mood.push({ day: today, emoji: todaysVibe });
  }
  try {
    await user.save();
    return res
      .status(200)
      .json({
        message: "todays Vibe updated successfully",
        todaysVibe: todaysVibe,
      });
  } catch (error) {
    return res.status(500).json({ message: "Error updating TodayVibe", error });
  }
};
exports.setTodaysVibe = setTodaysVibe;
