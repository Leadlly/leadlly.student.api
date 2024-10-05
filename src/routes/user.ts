import { getMentorInfo, getMonthlyReport, getOverallReport, getWeeklyReport, setTodaysVibe } from "./../controllers/User/index";
import express from "express";
import { deleteUnrevisedTopics, getUnrevisedTopics, storeUnrevisedTopics } from "../controllers/User/data";
import { checkAuth } from "../middlewares/checkAuth";
import convertToLowercase from "../middlewares/lowercase";
import { studentPersonalInfo } from "../controllers/User";
import { authorizeSubscriber } from "../middlewares/checkCategory";

const router = express.Router();

router.use(checkAuth, authorizeSubscriber('basic'));

router.post(
  "/progress/save",
  convertToLowercase,
  storeUnrevisedTopics,
);
router.get(
  "/topics/get",
  getUnrevisedTopics,
);
router.delete(
  "/topics/delete",
  deleteUnrevisedTopics
);
router.post("/profile/save", convertToLowercase, studentPersonalInfo);
router.post("/todaysVibe/save", setTodaysVibe);
router.get("/report/week", getWeeklyReport);
router.get("/report/month", getMonthlyReport);
router.get("/report/overall", getOverallReport);
router.get("/mentor/info", getMentorInfo);

export default router;
