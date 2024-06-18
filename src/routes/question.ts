import express from "express";
import { getChapter } from "../controllers/Question";


const router = express.Router();

router.get("/get/chapter", getChapter);

export default router;