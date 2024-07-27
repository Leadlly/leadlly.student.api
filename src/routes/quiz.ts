import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailyQuiz } from "../controllers/Quiz/DailyQuiz";
import { createWeeklyQuiz } from "../controllers/Quiz/WeeklyQuiz";

const router = express.Router();

router.post("/save", checkAuth, saveDailyQuiz);
router.post("/create/weekly", checkAuth, createWeeklyQuiz);

export default router;
