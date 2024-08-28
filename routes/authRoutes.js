import express from 'express'
import { signUp, login, logOut, submitPost, ensureAuthenticated } from '../services/authService.js'

const router = express.Router()

router.post('/signup', signUp)
router.post('/login', login)
router.post('/signout', logOut)
router.post('/submit/post', ensureAuthenticated, submitPost)

export default router
