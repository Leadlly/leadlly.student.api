import express from "express";
import { getChapter, getAllQuestion, getTopic } from "../controllers/QuestionBank";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.get("/chapter", checkAuth, getChapter);
router.get("/topic", checkAuth, getTopic);
router.get("/question", checkAuth, getAllQuestion);

export default router;
