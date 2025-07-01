import express from 'express';
import { ensureAuthenticated } from '../controllers/auth-controller.js';
import {
	followUser,
	unfollowUser,
	getFollowing,
	getFollowers,
	getFollowStats,
} from '../controllers/follow-controller.js';

const router = express.Router();

router.post('/follow', ensureAuthenticated, followUser);
router.post('/unfollow', ensureAuthenticated, unfollowUser);
router.get('/followers', ensureAuthenticated, getFollowers);
router.get('/following', ensureAuthenticated, getFollowing);
router.get('/follow/stats/:username', getFollowStats);

export default router;
