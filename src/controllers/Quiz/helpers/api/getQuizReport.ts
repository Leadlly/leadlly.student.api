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

    if (typeof quizId !== "string") {
      return next(new CustomError("Invalid quizId", 400));
    }

    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    let totalMarks = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const subjectWiseReport: Record<string, ISubjectWiseReport> = {};
    const subjectTotalCounts: Record<string, { correct: number; total: number }> = {};

    // Gather all question IDs from the quiz
    const questionIds = Object.values(quiz.questions).flat();

    // Batch fetch questions and solved questions
    const [fetchedQuestions, solvedQuestions] = await Promise.all([
      Question.find({ _id: { $in: questionIds } }).toArray(),
      SolvedQuestions.find({
        student: req.user._id,
        quizId: new mongoose.Types.ObjectId(quizId),
        question: { $in: questionIds }
      })
    ]);

    // Create maps for fast lookup
    const questionMap = fetchedQuestions.reduce((map, question) => {
      map[question._id.toString()] = question;
      return map;
    }, {} as Record<string, any>);

    const solvedQuestionMap = solvedQuestions.reduce((map, solved) => {
      map[solved.question.toString()] = solved;
      return map;
    }, {} as Record<string, ISolvedQuestion>);

    // Process each topic and its questions
    for (const topic in quiz.questions) {
      if (quiz.questions.hasOwnProperty(topic)) {
        const questions = quiz.questions[topic];

        for (const questionId of questions) {
          const fetchedQuestion = questionMap[questionId.toString()];
          if (!fetchedQuestion) {
            continue;
          }

          const subject = fetchedQuestion.subject;

          // Initialize subject and topic reports if not already present
          if (!subjectWiseReport[subject]) {
            subjectWiseReport[subject] = {
              efficiency: 0,
              topics: {}
            };
          }

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

          const solvedQuestion = solvedQuestionMap[questionId.toString()];
          const topicReport = subjectWiseReport[subject].topics[topic];

          if (solvedQuestion) {
            // Process based on whether the question was answered correctly, incorrectly, or unattempted
            if (solvedQuestion.isCorrect === true) {
              correctCount++;
              topicReport.correct++;
              totalMarks += 4;
              topicReport.totalMarks += 4;

              if (!subjectTotalCounts[subject]) {
                subjectTotalCounts[subject] = { correct: 0, total: 0 };
              }
              subjectTotalCounts[subject].correct++;
              subjectTotalCounts[subject].total++;
            } else if (solvedQuestion.isCorrect === false) {
              incorrectCount++;
              topicReport.incorrect++;
              totalMarks -= 1;
              topicReport.totalMarks -= 1;

              if (!subjectTotalCounts[subject]) {
                subjectTotalCounts[subject] = { correct: 0, total: 0 };
              }
              subjectTotalCounts[subject].total++;
            }
          } else {
            // Unattempted case
            unattemptedCount++;
            topicReport.unattempted++;
          }

          // Calculate efficiency for the topic
          const { correct, totalQuestions } = topicReport;
          if (totalQuestions > 0) {
            topicReport.efficiency = Math.max(0, Math.min(100, (correct / totalQuestions) * 100));
          }
        }
      }
    }

    // Calculate efficiency for each subject
    for (const subject in subjectTotalCounts) {
      const { correct, total } = subjectTotalCounts[subject];
      if (total > 0) {
        subjectWiseReport[subject].efficiency = Math.max(0, Math.min(100, (correct / total) * 100));
      }
    }

    // Overall efficiency calculation
    const totalQuestions = questionIds.length;
    const maxMarks = totalQuestions * 4;
    const overallEfficiency = maxMarks > 0 ? Math.max(0, Math.min(100, (correctCount / totalQuestions) * 100)) : 0;

    // Build the final report object
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
      questions: solvedQuestions.map(q => q._id),  // Store solvedQuestion IDs in the report
    };

    // Update or create the quiz report in the database
    const existingReport = await Quiz_Report.findOne({ user: new mongoose.Types.ObjectId(quiz.user!), quizId }).lean();
    if (existingReport) {
      await Quiz_Report.updateOne({ _id: existingReport._id }, { ...report, updatedAt: new Date() });
    } else {
      await new Quiz_Report(report).save();
    }

    // Generate full question details for the response
    const fullQuestions = solvedQuestions.map(solved => {
      const fetchedQuestion = questionMap[solved.question.toString()];
      return { ...solved.toObject(), question: fetchedQuestion };
    });
    
    quiz.attempted = true
    await quiz.save()

    return res.status(200).json({
      message: "Quiz report generated successfully",
      report: { ...report, questions: fullQuestions }  
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
    const solvedQuestionIds = quizReport.questions || [];

    const solvedQuestions = await SolvedQuestions.find({ _id: { $in: solvedQuestionIds } });
    const fullQuestions: any[] = [];
    
    for (let solvedQuestion of solvedQuestions) {
      // Fetch the full question details from the questions collection
      const fetchedQuestion = await Question.findOne({ _id: solvedQuestion.question });
    
      if (fetchedQuestion) {
        // Replace the question field in the solved question with the full question details
        const solvedQuestionWithFullQuestion = {
          ...solvedQuestion.toObject(), 
          question: fetchedQuestion      
        };
    
        // Push the modified solved question into the fullQuestions array
        fullQuestions.push(solvedQuestionWithFullQuestion);
      }
    }


    return res.status(200).json({
      message: "Quiz report fetched successfully",
      report : { ...quizReport, questions: fullQuestions},
    });
  } catch (error) {
    console.error("Error generating quiz report:", error);
    return next(new CustomError((error as Error).message));
  }
};
