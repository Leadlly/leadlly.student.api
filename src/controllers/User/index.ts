import { Request, Response } from 'express';
import User from '../../models/userModel';
import IUser from '../../types/IUser';
export const studentPersonalInfo = async (req: Request, res: Response) => {
  try {
    const bodyData = req.body;
    const user = await User.findById(req.user._id) as IUser;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bodyData.firstName) {
      user.firstname = bodyData.firstName;
    }

    if (bodyData.lastName) {
      user.lastname = bodyData.lastName;
    }

    if (bodyData.class) {
      user.about.standard = bodyData.class;
    }

    if (bodyData.dateOfBirth) {
      user.about.dateOfBirth = bodyData.dateOfBirth;
    }

    if (bodyData.phone) {
      user.phone = bodyData.phone;
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

    if (bodyData.competitiveExam) {
      user.academic.competitiveExam = bodyData.competitiveExam;
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
      user
    });
  } catch (error) {
    console.error("Error updating personal info:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
