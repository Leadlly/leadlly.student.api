import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import {
  buySubscription,
  cancelSubscription,
  getFreeTrialActive,
  verifySubscription,
} from "../controllers/Subscription";
import { getPricing } from "../controllers/Subscription/pricing";
import { getCoupon } from "../controllers/Subscription/coupon";

const router = express.Router();

//create subscription
router.post("/create", checkAuth, buySubscription);

//verify subscription
router.post("/verify", checkAuth, verifySubscription);

//cancel subscripiton
router.post("/cancel", checkAuth, cancelSubscription);

router.get("/freetrial", checkAuth, getFreeTrialActive);

router.get("/pricing/get", checkAuth, getPricing);

router.get("/coupons/get", checkAuth, getCoupon);
export default router;
