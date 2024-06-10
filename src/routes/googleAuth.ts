import express from "express";
import { googleAuth } from "../controllers/GoogleAuth";

const router = express.Router();

router.post("/auth", googleAuth);

export default router;
