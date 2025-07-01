import express from 'express';
import { signUp, login, signOut } from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/signout', signOut);

export default router;
