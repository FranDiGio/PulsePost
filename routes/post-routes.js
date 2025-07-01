import express from 'express';
import { ensureAuthenticated } from '../controllers/auth-controller.js';
import { submitPost, deletePost, toggleLike } from '../controllers/post-controller.js';

const router = express.Router();

router.post('/post', ensureAuthenticated, submitPost);
router.delete('/post', ensureAuthenticated, deletePost);
router.put('/likes/:postId', ensureAuthenticated, toggleLike);

export default router;
