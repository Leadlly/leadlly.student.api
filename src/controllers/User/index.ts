import { Request, Response } from 'express';
import User from '../../models/userModel';

export const studentPersonalInfo = async (req: Request, res: Response) => {
  try {
    const {
      name,
      class: studentClass,
      phone,
      parent,
      address,
      examName,
      schedule,
      school,
      coachingMode,
      coachingName,
    } = req.body;

    console.log("rwq", req.body);

    console.log("parent", parent)
    console.log("parent", address)
    console.log("parent", examName)
    console.log("parent",schedule)
    console.log("parent", school)
    console.log("parent", coachingMode)
    // Ensure req.user exists and has _id
    const userId = req.user ? req.user._id : null;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
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
  } catch (error) {
    console.error("Error updating personal info:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
