import express from "express";
import { googleAuth } from "../controllers/googleAuth";

const router = express.Router();

router.post("/auth", googleAuth);

export default router;
