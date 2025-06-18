import express from 'express';
import { signUp, login, signOut } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/signout', signOut);

export default router;
