import { db } from '../config/firebaseConfig.js';
import { ref, get, set, remove } from 'firebase/database';

// @route   POST /follow
// @desc    Follows the specified user
export async function followUser(req, res) {
	const { targetUser } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	if (typeof targetUser !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(targetUser)) {
		return res.status(400).json({ error: 'Invalid username format.' });
	}

	const sanitizedUsername = targetUser.trim().toLowerCase();
	const idSnapshot = await get(ref(db, `usernames/${sanitizedUsername}`));
	const targetId = idSnapshot.val();

	if (targetId == null) {
		return res.status(400).json({ error: 'User not found.' });
	}

	try {
		const targetUsernameSnap = await get(ref(db, `users/${targetId}/username`));
		const targetDisplayName = targetUsernameSnap.val();

		await set(ref(db, `/users/${targetId}/followers/${userId}`), username);
		await set(ref(db, `/users/${userId}/following/${targetId}`), targetDisplayName);

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

	if (typeof targetUser !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(targetUser)) {
		return res.status(400).json({ error: 'Invalid username format.' });
	}

	const sanitizedUsername = targetUser.trim().toLowerCase();
	const idSnapshot = await get(ref(db, `usernames/${sanitizedUsername}`));
	const targetId = idSnapshot.val();

	if (targetId == null) {
		return res.status(400).json({ error: 'User not found.' });
	}

	try {
		await remove(ref(db, `/users/${targetId}/followers/${userId}`));
		await remove(ref(db, `/users/${userId}/following/${targetId}`));

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

// @helper
// @desc    Gets follower/following counts by userId (used in profile render)
export async function getFollowStatsById(userId) {
	try {
		const followersSnap = await get(ref(db, `users/${userId}/followers`));
		const followingSnap = await get(ref(db, `users/${userId}/following`));

		return {
			followersCount: followersSnap.exists() ? Object.keys(followersSnap.val()).length : 0,
			followingCount: followingSnap.exists() ? Object.keys(followingSnap.val()).length : 0,
		};
	} catch (error) {
		console.error('Error fetching follow stats:', error);
		return { followersCount: 0, followingCount: 0 };
	}
}
