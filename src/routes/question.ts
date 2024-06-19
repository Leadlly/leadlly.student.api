import express from "express";
import { getChapter, getQuestion, getTopic } from "../controllers/Question";


const router = express.Router();

router.get("/chapter", getChapter);
router.get("/topic", getTopic);
router.get("/question", getQuestion);

export default router;