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

router.post('/users/:username/followers', ensureAuthenticated, followUser);
router.delete('/users/:username/followers', ensureAuthenticated, unfollowUser);
router.get('/users/:username/followers', getFollowers);
router.get('/users/:username/following', getFollowing);
router.get('/users/:username/follow-stats', getFollowStats);

export default router;
