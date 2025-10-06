import express from 'express';
import { ensureAuthenticated } from '../controllers/auth-controller.js';
import {
	submitPost,
	deletePost,
	getLatestPostsPage,
	getUserPostsPage,
	submitComment,
	deleteComment,
	getCommentsPage,
	addLike,
	removeLike,
} from '../controllers/post-controller.js';

const router = express.Router();

router.post('/posts', ensureAuthenticated, submitPost);
router.delete('/posts/:postId', ensureAuthenticated, deletePost);
router.get('/posts/latest', ensureAuthenticated, getLatestPostsPage);
router.get('/posts/:userId', ensureAuthenticated, getUserPostsPage);
router.post('/posts/:postId/comments', ensureAuthenticated, submitComment);
router.delete('/posts/:postId/comments/:commentId', ensureAuthenticated, deleteComment);
router.get('/posts/:postId/comments', ensureAuthenticated, getCommentsPage);
router.post('/posts/:postId/likes', ensureAuthenticated, addLike);
router.delete('/posts/:postId/likes', ensureAuthenticated, removeLike);

export default router;
