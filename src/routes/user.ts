import { setTodaysVibe } from './../controllers/User/index';
import express, { Request, Response, NextFunction } from 'express';
import { storeBackRevisionData } from '../controllers/User/data';
import { checkAuth } from '../middlewares/checkAuth';
import convertToLowercase from '../middlewares/lowercase';
import { studentPersonalInfo } from '../controllers/User';

const router = express.Router();

router.post('/progress/save', checkAuth, convertToLowercase, storeBackRevisionData);
router.post('/profile/save', checkAuth, studentPersonalInfo);
router.post('/todaysVibe/save', checkAuth, setTodaysVibe);

export default router;
