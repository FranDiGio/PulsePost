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

router.post('/picture', ensureAuthenticated, upload.single('profilePic'), uploadProfilePicture);
router.delete('/picture', ensureAuthenticated, deleteProfilePicture);
router.post('/background', ensureAuthenticated, upload.single('background'), uploadProfileBackground);
router.delete('/background', ensureAuthenticated, deleteProfileBackground);
router.put('/bio', ensureAuthenticated, updateBiography);
router.put('/password', ensureAuthenticated, resetPassword);
router.delete('/account', ensureAuthenticated, deleteAccount);

export default router;
