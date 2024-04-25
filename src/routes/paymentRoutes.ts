import express from "express";
import checkAuth from "../middlewares/checkAuth";
import { buySubscription } from "../controllers/paymentControllers";

const router = express.Router();

router.post("/create", checkAuth, buySubscription);

export default router;
