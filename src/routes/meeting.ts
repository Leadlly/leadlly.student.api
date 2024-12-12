import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { getMeetings, requestMeeting } from "../controllers/Meeting";
import { authorizeSubscriber } from "../middlewares/checkCategory";

const router = express.Router();

router.use(checkAuth, authorizeSubscriber());

router.post("/request", requestMeeting);
router.post("/get", getMeetings);

export default router;
