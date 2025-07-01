import express from 'express';
import { ensureAuthenticated } from '../controllers/authController.js';
import { submitPost, deletePost, toggleLike } from '../controllers/postController.js';

const router = express.Router();

router.post('/post', ensureAuthenticated, submitPost);
router.delete('/post', ensureAuthenticated, deletePost);
router.put('/likes/:postId', ensureAuthenticated, toggleLike);

export default router;
