import express from 'express'
import multer from 'multer'
import { ensureAuthenticated } from '../controllers/authController.js'
import { uploadProfilePicture } from '../controllers/settingsController.js'

const router = express.Router()
const upload = multer()

router.post('/upload/profile/picture', upload.single('profilePic'), uploadProfilePicture)

export default router
