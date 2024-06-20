import express from "express";
import { getAllQuestion, getChapter, getTopic } from "../controllers/Question";


const router = express.Router();

router.get("/get/chapter", getChapter);
router.get("/get/topic", getTopic);
router.get("/get/questions", getAllQuestion)


export default router;