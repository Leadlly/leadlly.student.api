import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../../../middlewares/error";
import SolvedQuestions, { ISolvedQuestion } from "../../../../models/solvedQuestions";
import { Quiz } from "../../../../models/quizModel";
import { questions_db } from "../../../../db/db"; 
import Quiz_Report, { ISubjectWiseReport } from "../../../../models/quizReportModel";
import mongoose from "mongoose";

// Function to get quiz report
export const generateQuizReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { quizId, timeTaken } = req.query;

    const Question = questions_db.collection("questionbanks");

    // Validate quizId
    if (typeof quizId !== "string") {
      return next(new CustomError("Invalid quizId", 400));
    }

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    // Initialize counters
    let totalMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const subjectWiseReport: Record<string, ISubjectWiseReport> = {};
    const subjectTotalCounts: Record<string, { correct: number; total: number }> = {};

    // To store all question IDs
    const questionIds: mongoose.Types.ObjectId[] = [];

    // Loop over the quiz questions (grouped by topics)
    for (const topic in quiz.questions) {
      if (quiz.questions.hasOwnProperty(topic)) {
        const questions = quiz.questions[topic];

        // Loop through each question in the topic
        for (const question of questions) {
          questionIds.push(new mongoose.Types.ObjectId(question));  // Store question ID

          const fetchedQuestion = await Question.findOne({ _id: question });
          if (!fetchedQuestion) {
            continue; // Skip if the question doesn't exist
          }

          // Ensure subject is assigned correctly
          const subject = fetchedQuestion.subject; 
          if (!subjectWiseReport[subject]) {
            subjectWiseReport[subject] = {
              efficiency: 0,
              topics: {}
            };
          }

          // Initialize topic report if not already
          if (!subjectWiseReport[subject].topics[topic]) {
            subjectWiseReport[subject].topics[topic] = {
              correct: 0,
              incorrect: 0,
              unattempted: 0,
              totalQuestions: questions.length,
              totalMarks: 0,
              efficiency: 0
            };
          }

          // Process the answer correctness
          const solvedQuestions = await SolvedQuestions.findOne({
            student: req.user._id,
            quizId: new mongoose.Types.ObjectId(quizId),
            question: fetchedQuestion._id
          }) as ISolvedQuestion;

          if (solvedQuestions) {
            const topicReport = subjectWiseReport[subject].topics[topic];

            if (solvedQuestions.isCorrect === true) {
              correctCount++;
              topicReport.correct++;
              totalMarks += 4;
              topicReport.totalMarks += 4;

              // Track correct answers for subject
              if (!subjectTotalCounts[subject]) {
                subjectTotalCounts[subject] = { correct: 0, total: 0 };
              }
              subjectTotalCounts[subject].correct++;
              subjectTotalCounts[subject].total++; // Increment total for correct answer
            } else if (solvedQuestions.isCorrect === false) {
              incorrectCount++;
              topicReport.incorrect++;
              totalMarks -= 1;
              topicReport.totalMarks -= 1;

              // Track attempted answers for subject
              if (!subjectTotalCounts[subject]) {
                subjectTotalCounts[subject] = { correct: 0, total: 0 };
              }
              subjectTotalCounts[subject].total++; // Increment total for incorrect answer
            } else {
              unattemptedCount++;
              topicReport.unattempted++;
            }

            // Calculate topic efficiency after processing all questions for the topic
            const { correct, totalQuestions } = topicReport;
            if (totalQuestions > 0) {
              topicReport.efficiency = Math.max(0, Math.min(100, (correct / totalQuestions) * 100));
            }
          }
        }
      }
    }

    for (const subject in subjectTotalCounts) {
      const { correct, total } = subjectTotalCounts[subject];
      if (total > 0) {
        subjectWiseReport[subject].efficiency = Math.max(0, Math.min(100, (correct / total) * 100));
      }
    }

    const totalQuestions = Object.values(quiz.questions).flat().length;
    const maxMarks = totalQuestions * 4;
    const overallEfficiency = maxMarks > 0 ? Math.max(0, Math.min(100, (correctCount / totalQuestions) * 100)) : 0;

    const report = {
      user: quiz.user,
      quizId,
      totalMarks,
      correctCount,
      incorrectCount,
      unattemptedCount,
      maxScore: maxMarks,
      overallEfficiency: Math.round(overallEfficiency),
      subjectWiseReport,
      timeTaken,
      questions: questionIds, 
    };

    const existingReport = await Quiz_Report.findOne({ user: new mongoose.Types.ObjectId(quiz.user!), quizId }).lean();
    if (existingReport) {
      await Quiz_Report.updateOne({ _id: existingReport._id }, { ...report, updatedAt: new Date() });
    } else {
      await new Quiz_Report(report).save();
    }

    // Fetch full question details and include them in the response
    const fullQuestions = await Question.find({ _id: { $in: questionIds } }).toArray();

    return res.status(200).json({
      message: "Quiz report generated successfully",
      report: { ...report, questions: fullQuestions}  
    });
  } catch (error: any) {
    console.error("Error generating quiz report:", error);
    next(new CustomError((error as Error).message));
  }
};

export const getQuizReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quizId } = req.query;

    if (!quizId || typeof quizId !== "string") {
      return next(new CustomError("Invalid QuizId"));
    }

    const quizReport = await Quiz_Report.findOne({ quizId: quizId as string, user: req.user._id }).lean();
    if (!quizReport) {
      return next(new CustomError("No Report exists for the corresponding quiz"));
    }

    const Question = questions_db.collection("questionbanks"); // Assuming you're using MongoDB for questions
    const questionIds = quizReport.questions || [];

    const fullQuestions = await Question.find({ _id: { $in: questionIds } }).toArray();

    return res.status(200).json({
      message: "Quiz report fetched successfully",
      report : { ...quizReport, questions: fullQuestions},
    });
  } catch (error) {
    console.error("Error generating quiz report:", error);
    return next(new CustomError((error as Error).message));
  }
};
