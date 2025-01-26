import express from 'express';
import { ensureAuthenticated } from '../controllers/authController.js';
import { submitPost, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.post('/submit/post', ensureAuthenticated, submitPost);
router.post('/delete/post', ensureAuthenticated, deletePost);

export default router;
