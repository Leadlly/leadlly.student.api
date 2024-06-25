import express, { Request, Response, NextFunction } from "express";
import { storeBackRevisionData } from "../controllers/User/data";
import { checkAuth } from "../middlewares/checkAuth";
import convertToLowercase from "../middlewares/lowercase";
import { studentPersonalInfo } from "../controllers/User";

const router = express.Router();

router.post("/progress/save", checkAuth, convertToLowercase, storeBackRevisionData);
router.post("/profile/save", checkAuth, studentPersonalInfo);

export default router;
