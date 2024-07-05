import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Student from '../../models/userModel';

const Mentor = mongoose.connection.collection('mentors');

export const allocateMentor = async (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.mentorId) {
      return res.status(400).json({ message: 'Student has a mentor assigned' });
    }

    const availableMentor = await Mentor.findOne({
      tag: student.tag,
      $expr: { $lt: [{ $size: '$students' }, 30] },
    });

    if (!availableMentor) {
      return res.status(404).json({ message: 'No available mentors' });
    }

    await Mentor.updateOne(
      { _id: availableMentor._id },
      { $push: { students: student._id } }
    );

    student.mentorId = new mongoose.Types.ObjectId(availableMentor._id.toString());
    await student.save();

    res.status(200).json({ message: 'Mentor allocated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
