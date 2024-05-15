import express from 'express'
import { coursePayment, createCourse, getAllCourses, getCourse, verifyPayment } from '../controllers/courseControllers'

const router = express.Router()

router.post('/create', createCourse)
// router.get('/:id', getCourse)
router.get('/all', getAllCourses)
router.post('/payment/:id', coursePayment)
router.post('/verifypayment', verifyPayment)

export default router