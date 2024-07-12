import { NextFunction, Request, Response } from "express";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import { todaysVibeSchema } from "../../Schemas/user.schema";
import { getSubjectList } from "../../utils/getSubjectList";
import { CustomError } from "../../middlewares/error";
export const studentPersonalInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bodyData = req.body;
    const user = (await User.findById(req.user._id)) as IUser;

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
      user.academic.subjects = getSubjectList(bodyData.competitiveExam);
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
  } catch (error: any) {
    console.error("Error updating personal info:", error);
    next(new CustomError(error.message))
  }
};

export const setTodaysVibe = async (req: Request, res: Response, next: NextFunction) => {
  const parsedResult = todaysVibeSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ message: "Invalid TodaysVibe value" });
  }

  const { todaysVibe } = parsedResult.data;
  const user = (await User.findById(req.user._id)) as IUser;

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
    return res.status(200).json({
      message: "todays Vibe updated successfully",
      todaysVibe: todaysVibe,
    });
  } catch (error: any) {
    next(new CustomError(error.message))
  }
};
