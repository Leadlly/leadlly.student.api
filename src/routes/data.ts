import express from 'express'
import { checkAuth } from '../middlewares/checkAuth'
import { getIntitutesLists } from '../controllers/Data';

const router = express.Router()

router.use(checkAuth)

router.get("/get/institutes", getIntitutesLists);

export default router