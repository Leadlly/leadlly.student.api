import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import {
  allocateBackTopicsToExistingPlanner,
  createPlanner,
  getPlanner,
  updateDailyPlanner,
} from "../controllers/Planner";
import { authorizeSubscriber } from "../middlewares/checkCategory";

const router = express.Router();

router.use(checkAuth);

router.get("/create", createPlanner);
router.get("/update", updateDailyPlanner);
router.get("/get", getPlanner);
router.get("/allocateTopics", allocateBackTopicsToExistingPlanner);

export default router;
