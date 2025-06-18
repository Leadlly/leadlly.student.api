import {
  checkForNotification,
  getInstituteInfo,
  getMentorInfo,
  getMonthlyReport,
  getOverallReport,
  getWeeklyReport,
  modifyNotificationStatus,
  setTodaysVibe,
} from "./../controllers/User/index";
import express from "express";
import {
  deleteUnrevisedTopics,
  getUnrevisedTopics,
  storeSubTopics,
  storeTopics,
  storeUnrevisedTopics,
} from "../controllers/User/data";
import { checkAuth } from "../middlewares/checkAuth";
import convertToLowercase from "../middlewares/lowercase";
import { studentPersonalInfo } from "../controllers/User";
import { authorizeSubscriber } from "../middlewares/checkCategory";
import {
  generateReferCode,
  getReferralCode,
} from "../controllers/ReferAndEarn";

const router = express.Router();

router.use(checkAuth);
router.post("/profile/save", convertToLowercase, studentPersonalInfo);

//referrals
router.post("/referral/create", generateReferCode);
router.get("/referral/get", getReferralCode);

router.post("/progress/save", convertToLowercase, storeTopics);
router.post("/unrevisedtopics/save", convertToLowercase, storeUnrevisedTopics);
router.post("/progress/save/subtopics", convertToLowercase, storeSubTopics);
router.get("/topics/get", getUnrevisedTopics);
router.delete("/topics/delete", deleteUnrevisedTopics);
router.post("/todaysVibe/save", setTodaysVibe);
router.get("/report/week", getWeeklyReport);
router.get("/report/month", getMonthlyReport);
router.get("/report/overall", getOverallReport);
router.get("/mentor/info", getMentorInfo);
router.get("/institute/info", getInstituteInfo);
router.get("/notification/check", checkForNotification);
router.put("/notification/update/:id", modifyNotificationStatus);

export default router;
