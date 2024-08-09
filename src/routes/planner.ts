import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import {
  allocateBackTopicsToExistingPlanner,
  createPlanner,
  getPlanner,
  updateDailyPlanner,
} from "../controllers/Planner";

const router = express.Router();

router.get("/create", checkAuth, createPlanner);
router.get("/update", checkAuth, updateDailyPlanner);
router.get("/get", checkAuth, getPlanner);
router.get("/allocateTopics", checkAuth, allocateBackTopicsToExistingPlanner);

export default router;
