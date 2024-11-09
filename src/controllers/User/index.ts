import { NextFunction, Request, Response } from "express";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import { todaysVibeSchema } from "../../Schemas/user.schema";
import { getSubjectList } from "../../utils/getSubjectList";
import { CustomError } from "../../middlewares/error";
import { StudentReport } from "../../models/reportModel";
import moment from 'moment';
import { db } from "../../db/db";

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

    if(bodyData.nextDay) {
      user.preferences.continuousData.nextDay = bodyData.nextDay
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

    user.updatedAt = new Date()
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
  const isSunday = () => {
    const today = new Date();
    return today.getDay() === 0; // Sunday is 0 in JavaScript
  };

  const parsedResult = todaysVibeSchema.safeParse(req.body);

  if (!parsedResult.success) {
    return res.status(400).json({ message: "Invalid TodaysVibe value" });
  }

  const { todaysVibe } = parsedResult.data;
  const user = (await User.findById(req.user._id)) as IUser;

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const today = new Date();
  const formattedToday = today.toISOString().split("T")[0]; // Format today's date (YYYY-MM-DD)
  const dayOfWeek = today.toLocaleString('en-US', { weekday: 'long' }); // e.g., 'Monday', 'Tuesday'

  // Initialize mood field if missing
  if (!user.details) {
    user.details = { mood: [] };
  }

  if (!user.details.mood) {
    user.details.mood = [];
  }

  // Check if today's mood is already set
  const todaysMoodIndex = user.details.mood.findIndex((moodEntry) => moodEntry.day === dayOfWeek);

  // If today is Sunday, clear mood for the entire week
  if (isSunday()) {
    user.details.mood = [];
  }

  // Check if the update date is next week
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7); // Get the date for one week ahead
  const targetDate = new Date(formattedToday); // User provided date

  if (targetDate > nextWeekDate) {
    // Reset all fields to null except the current day
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    user.details.mood = daysOfWeek.map((day) => {
      return {
        day: day,
        date: day === dayOfWeek ? formattedToday : null,
        emoji: day === dayOfWeek ? todaysVibe : null,
      };
    });
  } else {
    // Update today's mood
    if (todaysMoodIndex >= 0) {
      user.details.mood[todaysMoodIndex] = {
        day: dayOfWeek,
        emoji: todaysVibe,
        date: formattedToday,
      };
    } else {
      user.details.mood.push({
        day: dayOfWeek,
        emoji: todaysVibe,
        date: formattedToday,
      });
    }
  }

  try {
    await user.save();
    return res.status(200).json({
      message: "Today's Vibe updated successfully",
      todaysVibe,
    });
  } catch (error: any) {
    next(new CustomError(error.message));
  }
};


export const getWeeklyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = moment().startOf('isoWeek'); // assuming the week starts on Monday
    const endDate = moment().endOf('isoWeek');

    const reports = await StudentReport.find({
      user: req.user._id,
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    const daysInWeek = [];
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
      daysInWeek.push(date.clone());
    }

    const weeklyReport = {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      days: daysInWeek.map(day => {
        const report = reports.find(r => moment(r.date).isSame(day, 'day'));
        return {
          day: day.format('dddd'),
          date: day.format('YYYY-MM-DD'),
          session: report ? report.session : 0,
          quiz: report ? report.quiz : 0,
          overall: report ? report.overall : 0
        };
      })
    };

    res.status(200).json({
      success: true,
      weeklyReport
    });
  } catch (error) {
    next(new CustomError((error as Error).message));
  }
};

export const getMonthlyReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const startDate = moment().startOf('month');
    const endDate = moment().endOf('month');

    const reports = await StudentReport.find({
      user: req.user._id,
      date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
    });

    const daysInMonth = [];
    for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
      daysInMonth.push(date.clone());
    }

    const monthlyReport = {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      days: daysInMonth.map(day => {
        const report = reports.find(r => moment(r.date).isSame(day, 'day'));
        return {
          day: day.format('dddd'),
          date: day.format('YYYY-MM-DD'),
          session: report ? report.session : 0,
          quiz: report ? report.quiz : 0,
          overall: report ? report.overall : 0
        };
      })
    };

    res.status(200).json({
      success: true,
      monthlyReport
    });
  } catch (error) {
    next(new CustomError((error as Error).message));
  }
};

export const getOverallReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports = await StudentReport.find({
      user: req.user._id,
    });

    if (!reports.length) return next(new CustomError("No reports found for the user"));

    const uniqueDates = Array.from(new Set(reports.map(report => moment(report.date).format('YYYY-MM-DD'))));
    
    uniqueDates.sort((a, b) => moment(a).diff(moment(b)));
    
    // Generate report
    const overallReport = uniqueDates.map(dateString => {
      const dayReports = reports.filter(report => moment(report.date).isSame(dateString, 'day'));
      const aggregatedReport = dayReports.reduce((acc, report) => {
        acc.session += report.session;
        acc.quiz += report.quiz;
        acc.overall += report.overall;
        return acc;
      }, { session: 0, quiz: 0, overall: 0 });

      return {
        day: moment(dateString).format('dddd'),
        date: dateString,
        session: aggregatedReport.session,
        quiz: aggregatedReport.quiz,
        overall: aggregatedReport.overall
      };
    });

    res.status(200).json({
      success: true,
      overallReport
    });
  } catch (error) {
    next(new CustomError((error as Error).message));
  }
};


export const getMentorInfo = async(req: Request, res: Response, next: NextFunction) =>{
  try {
    const Mentor = db.collection('mentors')
    const mentorId = req.user.mentor.id

    if(!mentorId) next(new CustomError("Mentor not alloted", 400))
    
    const mentor = await Mentor.findOne({_id: mentorId })
    if(!mentor) next(new CustomError("Mentor not exists", 404))
    
    console.log(mentor)
    res.status(200).json({success: true, mentor})

  } catch (error) {
    next(new CustomError((error as Error).message));
  }
}