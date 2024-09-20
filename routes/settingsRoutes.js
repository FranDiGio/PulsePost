import express from 'express'
import multer from 'multer'
import { ensureAuthenticated } from '../controllers/authController.js'
import { uploadProfilePicture, deleteProfilePicture } from '../controllers/settingsController.js'

const router = express.Router()
const upload = multer()

router.post('/upload/profile/picture', upload.single('profilePic'), uploadProfilePicture)
router.get('/delete/profile/picture', deleteProfilePicture)

export default router
