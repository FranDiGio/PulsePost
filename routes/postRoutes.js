import express from 'express'
import { ensureAuthenticated } from '../services/authService.js'
import { submitPost } from '../services/postService.js'

const router = express.Router()

router.post('/submit/post', ensureAuthenticated, submitPost)

export default router
