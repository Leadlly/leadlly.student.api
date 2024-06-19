import express from "express";
import { getChapter, getQuestion, getTopic } from "../controllers/Question";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.get("/chapter", checkAuth, getChapter);
router.get("/topic", checkAuth, getTopic);
router.get("/question", checkAuth, getQuestion);

export default router;
