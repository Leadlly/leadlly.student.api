import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailyQuiz } from "../controllers/Quiz/DailyQuiz";

const router = express.Router();

router.post("/save", checkAuth, saveDailyQuiz);

export default router;
