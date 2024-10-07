import express from 'express';
import { ensureAuthenticated } from '../controllers/authController.js';
import { submitPost } from '../controllers/postController.js';

const router = express.Router();

router.post('/submit/post', ensureAuthenticated, submitPost);

export default router;
