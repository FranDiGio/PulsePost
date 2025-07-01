import { db } from '../config/firebase-config.js';
import { ref, get } from 'firebase/database';

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

// @desc    Gets follower list by userId
export async function getFollowersList(userId) {
	const followersRef = ref(db, `users/${userId}/followers`);
	const followersSnap = await get(followersRef);
	return followersSnap.exists() ? Object.keys(followersSnap.val()) : [];
}

// @desc    Gets following list by userId
export async function getFollowingList(userId) {
	const followingRef = ref(db, `users/${userId}/following`);
	const followingSnap = await get(followingRef);
	return followingSnap.exists() ? Object.keys(followingSnap.val()) : [];
}
