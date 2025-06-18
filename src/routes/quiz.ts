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
import { authorizeSubscriber } from "../middlewares/checkCategory";
import { createCustomQuiz } from "../controllers/Quiz/CustomQuiz";

const router = express.Router();

router.use(checkAuth, authorizeSubscriber());

router.post("/save", saveDailyQuiz);
router.post("/weekly/create", createWeeklyQuiz);
router.get("/weekly/get", getWeeklyQuiz);
router.get("/weekly/questions/get", getWeeklyQuizQuestions);
router.post("/weekly/questions/save", saveQuestions);
router.get("/submission", generateQuizReport);
router.get("/report", getQuizReport);
router.post("/custom/create", createCustomQuiz);

export default router;
