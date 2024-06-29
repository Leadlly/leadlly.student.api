import express from 'express'
import { checkAuth } from '../middlewares/checkAuth';
import { createPlanner, getPlanner, updateDailyPlanner } from '../controllers/Planner';

const router = express.Router();

router.post('/create', checkAuth, createPlanner);
router.post('/update', checkAuth, updateDailyPlanner);
router.get('/get', checkAuth, getPlanner);

export default router;
