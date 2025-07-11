import { getProfilePictureUrl } from './user-service.js';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebase-config.js';

// @desc    Retrieves latest posts and adds follow info & author profile pics
export async function getLatestPosts(userId) {
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
				const profilePictureUrl = await getProfilePictureUrl(post.uid);
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
export async function getUserPosts(profileId, currentUserId) {
	try {
		const postsRef = ref(db, `users/${profileId}/posts`);
		const postsSnapshot = await get(postsRef);
		const postsData = postsSnapshot.val();

		if (!postsData) return {};

		// Get the list of posts liked by the current user
		const likedSnap = await get(ref(db, `users/${currentUserId}/likes`));
		const likedPostIds = likedSnap.exists() ? Object.keys(likedSnap.val()) : [];

		for (const key in postsData) {
			if (postsData.hasOwnProperty(key)) {
				const post = postsData[key];

				// Add like status
				post.isLikedByCurrentUser = likedPostIds.includes(key);

				// Get like count for current post
				const likeList = await getPostLikes(key);
				post.likeCount = likeList.length;
			}
		}

		return postsData;
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
