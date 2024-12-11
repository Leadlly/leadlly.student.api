import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { getStudentTracker } from "../controllers/Tracker";
import { authorizeSubscriber } from "../middlewares/checkCategory";

const router = express.Router();

router.get("/get", checkAuth, authorizeSubscriber(), getStudentTracker);

export default router;
