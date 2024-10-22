import express from 'express';
import multer from 'multer';
import { ensureAuthenticated } from '../controllers/authController.js';
import {
	uploadProfilePicture,
	deleteProfilePicture,
	uploadProfileBackground,
	deleteProfileBackground,
	updateBiography,
	resetPassword,
	deleteAccount,
} from '../controllers/settingsController.js';

const router = express.Router();
const upload = multer();

router.post('/upload/picture', ensureAuthenticated, upload.single('profilePic'), uploadProfilePicture);
router.post('/delete/picture', ensureAuthenticated, deleteProfilePicture);
router.post('/upload/background', ensureAuthenticated, upload.single('background'), uploadProfileBackground);
router.post('/delete/background', ensureAuthenticated, deleteProfileBackground);
router.post('/update/bio', ensureAuthenticated, updateBiography);
router.post('/update/password', ensureAuthenticated, resetPassword);
router.post('/delete/account', ensureAuthenticated, deleteAccount);

export default router;
