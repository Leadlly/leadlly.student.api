import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import {
  buySubscription,
  cancelSubscription,
  getFreeTrialActive,
  verifySubscription,
} from "../controllers/Subscription";

const router = express.Router();

//create subscription
router.post("/create", checkAuth, buySubscription);

//verify subscription
router.post("/verify", checkAuth, verifySubscription);

//cancel subscripiton
router.post("/cancel", checkAuth, cancelSubscription);

router.get("/freetrial", checkAuth, getFreeTrialActive)
export default router;
