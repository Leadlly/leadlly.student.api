import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailyQuiz } from "../controllers/Quiz/DailyQuiz";
import {
  createWeeklyQuiz,
  getWeeklyQuiz,
  getWeeklyQuizQuestions,
  saveQuestions,
} from "../controllers/Quiz/WeeklyQuiz";
import { createCustomQuiz, getCreatedCustomQuiz, getCustomQuizQuestions, getTopicsForChapters, saveCustomQuizAnswers } from "../controllers/Quiz/CustomQuiz";

const router = express.Router();

router.post("/save", checkAuth, saveDailyQuiz);
router.post("/weekly/create", checkAuth, createWeeklyQuiz);
router.get("/weekly/get", checkAuth, getWeeklyQuiz);
router.get("/weekly/questions/get", checkAuth, getWeeklyQuizQuestions);
router.post("/weekly/questions/save", checkAuth, saveQuestions);


router.post("/custom/create" ,checkAuth ,createCustomQuiz)
router.get("/custom/get" ,checkAuth ,getCreatedCustomQuiz)
router.get("/custom/questions/get" , checkAuth , getCustomQuizQuestions)
router.post("/custom/questions/save" , checkAuth , saveCustomQuizAnswers)
router.post("/custom/getTopicsForChapters" ,checkAuth , getTopicsForChapters)
export default router;
