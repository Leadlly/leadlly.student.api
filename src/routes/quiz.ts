import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { saveDailQuiz } from "../controllers/Quiz/DailyQuiz";

const router = express.Router();

router.post("/save", checkAuth, saveDailQuiz);

export default router;
