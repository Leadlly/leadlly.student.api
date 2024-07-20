import { NextFunction, Request, Response } from "express";
import User from "../../models/userModel";
import IUser from "../../types/IUser";
import { todaysVibeSchema } from "../../Schemas/user.schema";
import { getSubjectList } from "../../utils/getSubjectList";
import { CustomError } from "../../middlewares/error";
import { StudentReport } from "../../models/reportModel";
import moment from 'moment';

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