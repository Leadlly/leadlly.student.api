import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { savePushToken } from "../controllers/Notifications/pushToken";
import { sendCustomNotification } from "../controllers/Notifications";

const router = express.Router();

router.post(
  "/pushtoken/save",
  checkAuth,
  savePushToken
);

router.post("/send-custom-notification", checkAuth, sendCustomNotification);

export default router;
