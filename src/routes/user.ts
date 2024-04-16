import express from 'express'
import { login, logout, register } from '../controllers/user'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/login', logout)

export default router