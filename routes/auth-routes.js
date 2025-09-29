import express from 'express';
import { createUser, createSession, destroySession } from '../controllers/auth-controller.js';

const router = express.Router();

router.post('/users', createUser);
router.post('/sessions', createSession);
router.delete('/sessions/me', destroySession);

export default router;
