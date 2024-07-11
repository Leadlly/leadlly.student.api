import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { getMeetings, requestMeeting } from "../controllers/Meeting";

const router = express.Router();

router.post("/request", checkAuth, requestMeeting);
router.post("/get", checkAuth, getMeetings);

export default router;
