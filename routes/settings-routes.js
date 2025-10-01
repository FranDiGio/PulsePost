import express from 'express';
import multer from 'multer';
import { ensureAuthenticated } from '../controllers/auth-controller.js';
import {
	uploadProfilePicture,
	deleteProfilePicture,
	uploadProfileBackground,
	deleteProfileBackground,
	updateBiography,
	resetPassword,
	deleteAccount,
} from '../controllers/settings-controller.js';

const router = express.Router();
const upload = multer();

router.post('/users/me/picture', ensureAuthenticated, upload.single('profilePic'), uploadProfilePicture);
router.delete('/users/me/picture', ensureAuthenticated, deleteProfilePicture);
router.post('/users/me/background', ensureAuthenticated, upload.single('background'), uploadProfileBackground);
router.delete('/users/me/background', ensureAuthenticated, deleteProfileBackground);
router.put('/users/me/bio', ensureAuthenticated, updateBiography);
router.put('/users/me/password', ensureAuthenticated, resetPassword);
router.delete('/users/me', ensureAuthenticated, deleteAccount);

export default router;
