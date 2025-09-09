import { ref, push, update, get, remove, set, orderByChild, limitToFirst, startAt, query } from 'firebase/database';
import { db } from '../config/firebase-config.js';
import { getPostLikes } from '../services/post-service.js';

// @route   POST /post
// @desc    Handles post submission and writes to DB
export async function submitPost(req, res) {
	const { title, content } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

	const trimmedTitle = (title || '').trim();
	const trimmedContent = (content || '').trim();

	if (!trimmedTitle || !trimmedContent) {
		return res.status(400).json({ errorCode: 'empty-fields', message: 'Title and content cannot be empty.' });
	}
	if (trimmedTitle.length > 100) {
		return res.status(400).json({ errorCode: 'title-too-long', message: 'Title cannot exceed 100 characters.' });
	}
	if (trimmedContent.length > 1500) {
		return res
			.status(400)
			.json({ errorCode: 'content-too-long', message: 'Content cannot exceed 1500 characters.' });
	}

	// Normalize content (collapse 3+ newlines to 2)
	const sanitizedContent = trimmedContent.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n');

	const nowMs = Date.now();
	const nowIso = new Date(nowMs).toISOString();

	// Full post document
	const postData = {
		uid: userId,
		author: username,
		title: trimmedTitle,
		content: sanitizedContent,
		commentCount: 0,
		createdAtMs: nowMs,
		createdAtIso: nowIso,
	};

	// Lightweight user ref
	const userPostRef = {
		title: trimmedTitle,
		createdAtMs: nowMs,
		createdAtIso: nowIso,
	};

	const newPostRef = push(ref(db, 'posts'));
	const newPostId = newPostRef.key;

	const updates = {
		[`/posts/${newPostId}`]: postData,
		[`/users/${userId}/posts/${newPostId}`]: userPostRef,
	};

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

		// Delete all like references from users who liked this post
		const likedBy = await getPostLikes(postId);

		for (const likerId of likedBy) {
			const userLikeRef = ref(db, `users/${likerId}/likes/${postId}`);
			await remove(userLikeRef);
			console.log(`Removed like reference to post ${postId} from user ${likerId}`);
		}

		const userPostRef = ref(db, `users/${userId}/posts/${postId}`);
		const commentsPostRef = ref(db, `comments/${postId}`);

		await Promise.all([remove(postRef), remove(userPostRef), remove(commentsPostRef)]);

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

// @route   GET /posts/:postId/comments?limit=5[&afterTs=...&afterId=...]
// @desc    Returns a page of comments sorted by createdAtMs ASC with look-ahead
export async function getCommentsPage(req, res) {
	const { postId } = req.params;
	const limit = Math.min(parseInt(req.query.limit || '5', 10), 50);
	const afterTs = req.query.afterTs ? Number(req.query.afterTs) : null;
	const afterId = req.query.afterId || null;

	try {
		let q;
		if (afterTs != null && afterId) {
			// Start from the last seen row (inclusive); will drop after fetching
			q = query(
				ref(db, `comments/${postId}`),
				orderByChild('createdAtMs'),
				startAt(afterTs, afterId),
				limitToFirst(limit + 1),
			);
		} else {
			// First page
			q = query(ref(db, `comments/${postId}`), orderByChild('createdAtMs'), limitToFirst(limit + 1));
		}

		const snap = await get(q);
		if (!snap.exists()) {
			return res.json({ items: [], next: null });
		}

		const entries = Object.entries(snap.val());

		// Drop overlap row if using a cursor
		let rows = afterTs != null && afterId ? entries.slice(1) : entries;

		// Use look-ahead to decide if more pages exist
		const hasMore = rows.length > limit;
		if (hasMore) rows = rows.slice(0, limit);

		const items = rows.map(([id, data]) => ({ id, ...data }));

		const last = items[items.length - 1];
		const next = hasMore && last ? { afterTs: last.createdAtMs, afterId: last.id } : null;

		return res.json({ items, next });
	} catch (err) {
		console.error('getCommentsPage error:', err);
		return res.status(500).json({ errorCode: 'server-error', message: 'Failed to load comments' });
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
