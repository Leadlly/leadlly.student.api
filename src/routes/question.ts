import express from "express";
import {
  getChapter,
  getTopic,
  getStreakQuestion,
  getSubtopics,
} from "../controllers/QuestionBank";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.get("/chapter", checkAuth, getChapter);
router.get("/topic", checkAuth, getTopic);
router.get("/subtopic", checkAuth,  getSubtopics);
router.get("/streakquestion", checkAuth, getStreakQuestion);

export default router;
