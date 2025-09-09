import { getUserData, getUserProfilePictureUrl } from './user-service.js';
import { ref, get, query, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../config/firebase-config.js';

// @desc    Retrieves latest posts and adds follow info & author profile pics
export async function getLatestPosts(userData, userId) {
	try {
		const postsRef = ref(db, `posts`);
		const postsSnapshot = await get(postsRef);
		const postsData = postsSnapshot.val();

		// Get the list of posts liked by the current user
		const likedSnap = await get(ref(db, `users/${userId}/likes`));
		const likedPostIds = likedSnap.exists() ? Object.keys(likedSnap.val()) : [];

		for (const key in postsData) {
			if (postsData.hasOwnProperty(key)) {
				const post = postsData[key];

				// Get author's profile picture
				const profilePictureUrl = await getUserProfilePictureUrl(userData);
				post.profilePictureUrl = profilePictureUrl;

				// Add like status
				post.isLikedByCurrentUser = likedPostIds.includes(key);

				// Get like count for current post
				const likeList = await getPostLikes(key);
				post.likeCount = likeList.length;

				// Skip follow check if the post belongs to the current user
				if (post.uid === userId) {
					post.isFollowedByCurrentUser = null;
					continue;
				}

				// Resolve author's UID from their username
				const author = post.author.toLowerCase();
				const authorIdSnap = await get(ref(db, `usernames/${author}`));
				const authorId = authorIdSnap.val();

				// Check if current user follows the author
				const followSnap = await get(ref(db, `users/${authorId}/followers/${userId}`));
				post.isFollowedByCurrentUser = followSnap.exists();
			}
		}

		return postsData;
	} catch (error) {
		console.error('Error fetching posts:', error);
		return '';
	}
}

// @desc    Gets all posts created by the given user with like info
export async function getUserPosts(profileId, currentUserId, limit = 5) {
	try {
		// Read lightweight refs from /users/{uid}/posts (sorted by createdAtMs)
		const lightSnap = await get(
			query(ref(db, `users/${profileId}/posts`), orderByChild('createdAtMs'), limitToLast(limit)),
		);
		if (!lightSnap.exists()) return {};

		const lightMap = lightSnap.val();

		const orderedIds = Object.entries(lightMap)
			.sort(([, a], [, b]) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
			.map(([postId]) => postId);

		const likedSnap = await get(ref(db, `users/${currentUserId}/likes`));
		const likedSet = likedSnap.exists() ? new Set(Object.keys(likedSnap.val())) : new Set();

		const fullSnaps = await Promise.all(orderedIds.map((id) => get(ref(db, `posts/${id}`))));

		// Merge full post with lightweight fields + isLiked flag
		const result = {};
		fullSnaps.forEach((snap, idx) => {
			const postId = orderedIds[idx];
			const full = snap.val() || {};
			const light = lightMap[postId] || {};

			result[postId] = {
				id: postId,
				...full,
				title: full.title ?? light.title,
				createdAtMs: full.createdAtMs ?? light.createdAtMs ?? 0,
				createdAtIso: full.createdAtIso ?? light.createdAtIso ?? null,
				isLikedByCurrentUser: likedSet.has(postId),
				likeCount: typeof full.likeCount === 'number' ? full.likeCount : 0,
			};
		});

		return result;
	} catch (error) {
		console.error('Error fetching user posts:', error);
		return {};
	}
}

// @desc    Gets count of posts created by the given user
export async function getUserPostCount(userId) {
	try {
		const postsRef = ref(db, `users/` + userId + '/posts');
		const postsSnapshot = await get(postsRef);

		return postsSnapshot.exists() ? Object.keys(postsSnapshot.val()).length : 0;
	} catch (error) {
		console.error('Error fetching posts:', error);
		return '';
	}
}

// @desc    Get post likes list by post ID
export async function getPostLikes(postId) {
	try {
		const likesSnap = await get(ref(db, `posts/` + postId + '/likes'));
		return likesSnap.exists() ? Object.keys(likesSnap.val()) : [];
	} catch (error) {
		console.error('Error fetching likes:', error);
		return [];
	}
}
