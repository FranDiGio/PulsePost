import express from 'express';
import multer from 'multer';
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

router.post('/upload/picture', upload.single('profilePic'), uploadProfilePicture);
router.post('/delete/picture', deleteProfilePicture);
router.post('/upload/background', upload.single('background'), uploadProfileBackground);
router.post('/delete/background', deleteProfileBackground);
router.post('/update/bio', updateBiography);
router.post('/update/password', resetPassword);
router.post('/delete/account', deleteAccount);

export default router;
