import express from 'express'
import { checkAuth } from '../middlewares/checkAuth'
import { 
    requestBatch, 
    requestClass, 
    getRequestStatus, 
    getClassesByStatus,
    getAllClasses
} from '../controllers/batchManagment'

const router = express.Router()

router.use(checkAuth)

// Batch request routes
router.post('/request', requestBatch)
router.post('/class/request', requestClass)

// Status routes
router.get('/requests/status', getRequestStatus)
router.get('/classes/approved', getClassesByStatus)
router.get('/classes', getClassesByStatus)
router.get('/classes/all', getAllClasses)

export default router