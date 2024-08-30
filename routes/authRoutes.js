import express from 'express'
import { signUp, login, logOut, ensureAuthenticated } from '../services/authService.js'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/signout', logOut)

export default router
