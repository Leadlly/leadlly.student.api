import express from "express";
import { storeBackRevisionData } from "../controllers/User/data";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/progress/save", storeBackRevisionData);

export default router;
