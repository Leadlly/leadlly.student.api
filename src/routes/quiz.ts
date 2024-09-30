import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailyQuiz } from "../controllers/Quiz/DailyQuiz";
import {
  createWeeklyQuiz,
  getWeeklyQuiz,
  getWeeklyQuizQuestions,
  saveQuestions
} from "../controllers/Quiz/WeeklyQuiz";
import { generateQuizReport, getQuizReport } from "../controllers/Quiz/helpers/api/getQuizReport";

const router = express.Router();

router.post("/save", checkAuth, saveDailyQuiz);
router.post("/weekly/create", checkAuth, createWeeklyQuiz);
router.get("/weekly/get", checkAuth, getWeeklyQuiz);
router.get("/weekly/questions/get", checkAuth, getWeeklyQuizQuestions);
router.post("/weekly/questions/save", checkAuth, saveQuestions);
router.get("/submission", checkAuth, generateQuizReport);
router.get("/report", checkAuth, getQuizReport);

export default router;
