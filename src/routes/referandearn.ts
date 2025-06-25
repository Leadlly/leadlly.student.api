import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import {
  generateReferCode,
  getReferralCode,
} from "../controllers/ReferAndEarn";

const router = express.Router();

router.use(checkAuth);

router.post("/code/generate", generateReferCode);
router.get("/code/get", getReferralCode);

export default router;
