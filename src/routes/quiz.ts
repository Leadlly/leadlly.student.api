import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailyQuiz } from "../controllers/Quiz/DailyQuiz";
import {
  createWeeklyQuiz,
  getWeeklyQuiz,
  getWeeklyQuizQuestions,
  saveQuestions,
} from "../controllers/Quiz/WeeklyQuiz";

const router = express.Router();

router.post("/save", checkAuth, saveDailyQuiz);
router.post("/weekly/create", checkAuth, createWeeklyQuiz);
router.get("/weekly/get", checkAuth, getWeeklyQuiz);
router.get("/weekly/questions/get", checkAuth, getWeeklyQuizQuestions);
router.post("/weekly/questions/save", checkAuth, saveQuestions);

export default router;
