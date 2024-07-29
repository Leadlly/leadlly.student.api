import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailyQuiz } from "../controllers/Quiz/DailyQuiz";
import {
  createWeeklyQuiz,
  getWeeklyQuiz,
} from "../controllers/Quiz/WeeklyQuiz";

const router = express.Router();

router.post("/save", checkAuth, saveDailyQuiz);
router.post("/weekly/create", checkAuth, createWeeklyQuiz);
router.get("/weekly/get", checkAuth, getWeeklyQuiz);

export default router;
