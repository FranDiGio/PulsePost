import { ref, push, update, get, remove } from 'firebase/database';
import { db } from '../config/firebaseConfig.js';

// @route   POST /post
// @desc    Handles post submission and writes to DB
export async function submitPost(req, res) {
	const { title, content } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	if (!title || !content) {
		return res.status(400).json({ errorCode: 'empty-fields', message: 'Title and content cannot be empty.' });
	}
	if (title.length > 100) {
		return res.status(400).json({ errorCode: 'title-too-long', message: 'Title cannot exceed 100 characters.' });
	}
	if (content.length > 1500) {
		return res
			.status(400)
			.json({ errorCode: 'content-too-long', message: 'Content cannot exceed 1500 characters.' });
	}

	// Replace multiple consecutive line breaks with a double line break
	let sanitizedContent = content.replace(/\n{3,}/g, '\n\n').trim();

	const postData = {
		uid: userId,
		author: username,
		title: title,
		content: sanitizedContent,
		createdTimestamp: new Date().toISOString(),
	};

	const newPostRef = push(ref(db, 'posts'));
	const newPostId = newPostRef.key;

	// Prepare updates to add the post in both 'posts' and 'users/{userId}/posts'
	const updates = {};
	updates[`/posts/${newPostId}`] = postData;
	updates[`/users/${userId}/posts/${newPostId}`] = postData;

	try {
		await update(ref(db), updates);
		res.redirect('/feed');
	} catch (error) {
		console.error('Error submitting post:', error);
		res.status(500).send('Error submitting post');
	}
}

// @route   DELETE /post
// @desc    Deletes a post if the user is the owner
export async function deletePost(req, res) {
	try {
		const { postId } = req.body;
		const userId = req.session.userId;

		const postRef = ref(db, `posts/${postId}`);
		const postSnapshot = await get(postRef);

		if (!postSnapshot.exists()) {
			return res.status(404).json({ error: 'Post not found' });
		}

		const postData = postSnapshot.val();

		// Check if the user owns the post
		if (postData.uid !== userId) {
			return res.status(403).json({ error: 'Forbidden: You do not own this post' });
		}

		const userPostRef = ref(db, `users/${userId}/posts/${postId}`);
		await Promise.all([
			remove(postRef), // Delete from `posts/${postId}`
			remove(userPostRef), // Delete from `users/${userId}/posts/${postId}`
		]);

		return res.json({ message: 'Post deleted successfully' });
	} catch (error) {
		console.error('Error deleting post:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// @helper
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

// @helper
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
