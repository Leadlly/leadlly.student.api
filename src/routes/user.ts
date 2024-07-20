import { getMonthlyReport, getStudentReport, getWeeklyReport, setTodaysVibe } from "./../controllers/User/index";
import express from "express";
import { deleteUnrevisedTopics, getUnrevisedTopics, storeUnrevisedTopics } from "../controllers/User/data";
import { checkAuth } from "../middlewares/checkAuth";
import convertToLowercase from "../middlewares/lowercase";
import { studentPersonalInfo } from "../controllers/User";

const router = express.Router();

router.post(
  "/progress/save",
  checkAuth,
  convertToLowercase,
  storeUnrevisedTopics,
);
router.get(
  "/topics/get",
  checkAuth,
  getUnrevisedTopics,
);
router.delete(
  "/topics/delete",
  checkAuth,
  deleteUnrevisedTopics
);
router.post("/profile/save", checkAuth, convertToLowercase, studentPersonalInfo);
router.post("/todaysVibe/save", checkAuth, setTodaysVibe);
router.get("/report/week", checkAuth, getWeeklyReport);
router.get("/report/month", checkAuth, getMonthlyReport);

export default router;
