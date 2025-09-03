import express from 'express';
import { ensureAuthenticated } from '../controllers/auth-controller.js';
import { submitPost, deletePost, submitComment, getCommentsPage, toggleLike } from '../controllers/post-controller.js';

const router = express.Router();

router.post('/post', ensureAuthenticated, submitPost);
router.delete('/post', ensureAuthenticated, deletePost);
router.post('/posts/:postId/comments', ensureAuthenticated, submitComment);
router.get('/posts/:postId/comments', ensureAuthenticated, getCommentsPage);
router.put('/likes/:postId', ensureAuthenticated, toggleLike);

export default router;
