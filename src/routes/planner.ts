import express from 'express'
import { checkAuth } from '../middlewares/checkAuth';
import { createPlanner, updateDailyPlanner } from '../controllers/Planner';

const router = express.Router();

router.post('/create', checkAuth, createPlanner);
router.post('/update', checkAuth, updateDailyPlanner);

export default router;
