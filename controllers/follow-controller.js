import { getIdFromUsername } from '../services/user-service.js';
import { db } from '../config/firebase-config.js';
import { ref, get, set, remove } from 'firebase/database';

// @route   POST /follow
// @desc    Follows the specified user
export async function followUser(req, res) {
	const { targetUser } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	const { uid: targetId, error } = await getIdFromUsername(targetUser);
	if (error) return res.status(400).json({ error });

	try {
		const alreadyFollowing = await get(ref(db, `/users/${userId}/following/${targetId}`));
		if (alreadyFollowing.exists()) {
			return res.status(400).json({ error: 'You are already following this user.' });
		}

		const nameSnap = await get(ref(db, `users/${targetId}/username`));
		const targetDisplayName = nameSnap.val();

		await Promise.all([
			set(ref(db, `/users/${targetId}/followers/${userId}`), username),
			set(ref(db, `/users/${userId}/following/${targetId}`), targetDisplayName),
		]);

		res.status(200).send('Successful');
	} catch (error) {
		console.error('Error following user:', error);
		res.status(500).send('Error following user');
	}
}

// @route   POST /unfollow
// @desc    Unfollows the specified user
export async function unfollowUser(req, res) {
	const { targetUser } = req.body;
	const userId = req.session.userId;

	const { uid: targetId, error } = await getIdFromUsername(targetUser);
	if (error) return res.status(400).json({ error });

	try {
		const isFollowing = await get(ref(db, `/users/${userId}/following/${targetId}`));
		if (!isFollowing.exists()) {
			return res.status(400).json({ error: 'You are not following this user.' });
		}

		await Promise.all([
			remove(ref(db, `/users/${targetId}/followers/${userId}`)),
			remove(ref(db, `/users/${userId}/following/${targetId}`)),
		]);

		res.status(200).send('Successful');
	} catch (error) {
		console.error('Error unfollowing user:', error);
		res.status(500).send('Error unfollowing user');
	}
}

// @route   GET /followers
// @desc    Returns list of followers for the current user
export async function getFollowers(req, res) {
	try {
		const userId = req.session.userId;

		const followersRef = ref(db, `users/` + userId + '/followers');
		const followersSnapshot = await get(followersRef);
		const followersData = followersSnapshot.val();

		res.send(followersData);
	} catch (error) {
		console.error('Error fetching followers:', error);
		res.status(500).json({ error: 'Failed to fetch followers.' });
	}
}

// @route   GET /following
// @desc    Returns list of users the current user is following
export async function getFollowing(req, res) {
	try {
		const userId = req.session.userId;

		const followingRef = ref(db, `users/` + userId + '/following');
		const followingSnapshot = await get(followingRef);
		const followingData = followingSnapshot.val();

		res.send(followingData);
	} catch (error) {
		console.error('Error fetching following:', error);
		res.status(500).json({ error: 'Failed to fetch following.' });
	}
}

// @route   GET /follow/stats/:username
// @desc    Returns follower/following count for the given username
export async function getFollowStats(req, res) {
	try {
		const username = req.params.username;
		const sanitizedUsername = username.trim().toLowerCase();

		const targetIdSnap = await get(ref(db, `usernames/${sanitizedUsername}`));
		const targetId = targetIdSnap.val();

		const followersSnap = await get(ref(db, `users/${targetId}/followers`));
		const followingSnap = await get(ref(db, `users/${targetId}/following`));

		const followers = followersSnap.exists() ? Object.keys(followersSnap.val()).length : 0;
		const following = followingSnap.exists() ? Object.keys(followingSnap.val()).length : 0;

		res.json({ followers, following });
	} catch (error) {
		console.error('Error fetching follow stats:', error);
		res.status(500).json({ error: 'Failed to fetch follow stats.' });
	}
}
