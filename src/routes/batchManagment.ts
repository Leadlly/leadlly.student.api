import express from 'express'
import { checkAuth } from '../middlewares/checkAuth'
import { 
    requestBatch, 
    requestClass, 
    getRequestStatus, 
    getApprovedClasses,
    getClassesByStatus
} from '../controllers/batchManagment'

const router = express.Router()

router.use(checkAuth)

// Batch request routes
router.post('/request', requestBatch)
router.post('/class/request', requestClass)

// Status routes
router.get('/requests/status', getRequestStatus)
router.get('/classes/approved', getApprovedClasses)
router.get('/classes', getClassesByStatus)

export default router