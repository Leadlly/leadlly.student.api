import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { getStudentTracker } from "../controllers/Tracker";

const router = express.Router();

router.get("/get", checkAuth, getStudentTracker);

export default router;
