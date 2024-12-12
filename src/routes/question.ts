import express from "express";
import {
  getChapter,
  getTopic,
  getStreakQuestion,
  getSubtopics,
  getTopicWithSubtopics,
} from "../controllers/QuestionBank";
import { checkAuth } from "../middlewares/checkAuth";
import { authorizeSubscriber } from "../middlewares/checkCategory";

const router = express.Router();

router.use(checkAuth, authorizeSubscriber());

router.get("/chapter", getChapter);
router.get("/topic", getTopic);
router.get("/topicwithsubtopic", getTopicWithSubtopics);
router.get("/subtopic", getSubtopics);
router.get("/streakquestion", getStreakQuestion);

export default router;
