import express from 'express';
import { ensureAuthenticated } from '../controllers/authController.js';
import { submitPost, deletePost } from '../controllers/postController.js';

const router = express.Router();

router.post('/post', ensureAuthenticated, submitPost);
router.delete('/post', ensureAuthenticated, deletePost);

export default router;
