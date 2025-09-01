import { ref, push, update, get, remove, set } from 'firebase/database';
import { db } from '../config/firebase-config.js';
import { getPostLikes } from '../services/post-service.js';

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

		// Remove all like references from users who liked this post
		const likedBy = await getPostLikes(postId);

		for (const likerId of likedBy) {
			const userLikeRef = ref(db, `users/${likerId}/likes/${postId}`);
			await remove(userLikeRef);
			console.log(`Removed like reference to post ${postId} from user ${likerId}`);
		}

		// Delete post from global posts and from user's personal posts
		const userPostRef = ref(db, `users/${userId}/posts/${postId}`);
		await Promise.all([remove(postRef), remove(userPostRef)]);

		return res.json({ message: 'Post deleted successfully' });
	} catch (error) {
		console.error('Error deleting post:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// @route   POST /posts/:postId/comments
// @desc    Creates a comment at /comments/{postId}/{commentId} and updates lightweight fields under /posts/{postId}
export async function submitComment(req, res) {
	const { postId } = req.params;
	const { comment } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	// basic validation + normalize
	const body = (comment || '')
		.replace(/\r\n/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
	if (!body) {
		return res.status(400).json({ errorCode: 'empty-fields', message: 'Comment cannot be empty.' });
	}
	if (body.length > 300) {
		return res
			.status(400)
			.json({ errorCode: 'content-too-long', message: 'Comment cannot exceed 300 characters.' });
	}

	const snap = await get(ref(db, `posts/${postId}`));
	if (!snap.exists()) {
		return res.status(404).json({ errorCode: 'post-not-found', message: 'Post does not exist.' });
	}

	const nowMs = Date.now();
	const nowIso = new Date(nowMs).toISOString();

	// create the comment key
	const commentRef = push(ref(db, `comments/${postId}`));
	const commentId = commentRef.key;

	const commentData = {
		postId,
		uid: userId,
		author: username,
		comment: body,
		createdAtMs: nowMs,
		createdAtIso: nowIso,
	};

	const updates = {
		[`/comments/${postId}/${commentId}`]: commentData,
		[`/posts/${postId}/commentCount`]: (snap.val()?.commentCount || 0) + 1,
	};

	try {
		await update(ref(db), updates);
		return res.status(201).json({ ok: true, comment: commentData });
	} catch (err) {
		console.error('Error submitting comment:', err);
		return res.status(500).json({ errorCode: 'server-error', message: 'Error submitting comment' });
	}
}

// @route   PUT /likes/:postId
// @desc    Toggles like status for a post
export async function toggleLike(req, res) {
	try {
		const { postId } = req.params;
		const userId = req.session.userId;

		const postRef = ref(db, `posts/${postId}`);
		const postSnapshot = await get(postRef);

		if (!postSnapshot.exists()) {
			return res.status(404).json({ error: 'Post not found' });
		}

		const userLikeRef = ref(db, `users/${userId}/likes/${postId}`);
		const userLikeSnapshot = await get(userLikeRef);

		if (userLikeSnapshot.exists()) {
			// Unlike
			await remove(userLikeRef);
			await remove(ref(db, `posts/${postId}/likes/${userId}`));
			return res.json({ message: 'Post unliked' });
		} else {
			// Like
			await set(userLikeRef, true);
			await set(ref(db, `posts/${postId}/likes/${userId}`), true);
			return res.json({ message: 'Post liked' });
		}
	} catch (error) {
		console.error('Error toggling like:', error);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}
