import { getProfilePictureUrl } from '../services/userService.js';
import { ref, get } from 'firebase/database';
import { db } from '../config/firebaseConfig.js';

// @desc    Retrieves latest posts and adds follow info & author profile pics
export async function getLatestPosts(userId) {
	try {
		const postsRef = ref(db, `posts`);
		const postsSnapshot = await get(postsRef);
		const postsData = postsSnapshot.val();

		for (const key in postsData) {
			if (postsData.hasOwnProperty(key)) {
				const post = postsData[key];

				// Get author's profile picture
				const profilePictureUrl = await getProfilePictureUrl(post.uid);
				post.profilePictureUrl = profilePictureUrl;

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

// @desc    Gets all posts created by the given user
export async function getUserPosts(userId) {
	try {
		const postsRef = ref(db, `users/` + userId + '/posts');
		const postsSnapshot = await get(postsRef);
		const postsData = postsSnapshot.val();

		return postsData;
	} catch (error) {
		console.error('Error fetching posts:', error);
		return '';
	}
}
