import {
	ref,
	push,
	update,
	get,
	remove,
	set,
	orderByChild,
	limitToFirst,
	startAt,
	query,
	runTransaction,
} from 'firebase/database';
import { db } from '../config/firebase-config.js';
import { fetchUserPostsPage, getPostLikes } from '../services/post-service.js';

// @route   POST /posts
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
		likeCount: 0,
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

// @route   DELETE /posts/:postId
// @desc    Deletes a post if the user is the owner
export async function deletePost(req, res) {
	try {
		const postId = req.params.postId;
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

// @route   GET /posts/:userId
// @desc    Return a paginated list of a user's posts
export async function getUserPostsPage(req, res) {
	try {
		const profileId = req.params.userId;
		const currentUserId = req.session.userId;
		const limit = Math.min(Number(req.query.limit) || 10, 30);
		const beforeTs = req.query.beforeTs ? Number(req.query.beforeTs) : Number.MAX_SAFE_INTEGER;

		if (!Number.isFinite(beforeTs)) {
			return res.status(400).json({ error: 'Invalid beforeTs' });
		}

		const { items, nextCursor } = await fetchUserPostsPage(profileId, currentUserId, limit, beforeTs);
		res.json({ items, nextCursor });
	} catch (e) {
		console.error('GET /posts/:userId/ error', e);
		res.status(500).json({ error: 'Failed to load posts' });
	}
}

// @route   POST /posts/:postId/comments
// @desc    Creates a comment at /comments/{postId}/{commentId} and updates lightweight fields under /posts/{postId}
export async function submitComment(req, res) {
	const { postId } = req.params;
	const { comment } = req.body;
	const userId = req.session.userId;
	const username = req.session.username;

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

	const commentRef = push(ref(db, `comments/${postId}`));
	const commentId = commentRef.key;

	const commentData = {
		uid: userId,
		author: username,
		content: body,
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

// @route   DELETE /posts/:postId/comments/:commentId
// @desc    Delete a specific comment on a post
export async function deleteComment(req, res) {
	try {
		const { postId, commentId } = req.params;
		const userId = req.session.userId;

		const commentRef = ref(db, `comments/${postId}/${commentId}`);
		const commentSnap = await get(commentRef);

		const postRef = ref(db, `posts/${postId}`);
		const postSnap = await get(postRef);

		if (!commentSnap.exists() || !postSnap.exists()) {
			return res.status(404).json({ error: 'Comment not found' });
		}

		const comment = commentSnap.val();
		const post = postSnap.val();

		console.log(post.uid, userId);

		if (comment.uid !== userId && post.uid !== userId) {
			return res.status(403).json({ error: 'Forbidden: You do not own this comment' });
		}

		await remove(commentRef);

		const countRef = ref(db, `posts/${postId}/commentCount`);
		await runTransaction(countRef, (curr) => {
			const n = Number(curr) || 0;
			return n > 0 ? n - 1 : 0;
		});

		return res.json({ message: 'Comment deleted' });
	} catch (err) {
		console.error('Error deleting comment:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
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
		// Fetch post owner
		const currentUserId = req.session.userId;
		const postOwnerSnap = await get(ref(db, `posts/${postId}/uid`));
		const postOwnerId = postOwnerSnap.exists() ? postOwnerSnap.val() : null;

		let q;
		if (afterTs != null && afterId) {
			q = query(
				ref(db, `comments/${postId}`),
				orderByChild('createdAtMs'),
				startAt(afterTs, afterId),
				limitToFirst(limit + 1),
			);
		} else {
			q = query(ref(db, `comments/${postId}`), orderByChild('createdAtMs'), limitToFirst(limit + 1));
		}

		const snap = await get(q);
		if (!snap.exists()) {
			return res.json({ items: [], next: null });
		}

		const entries = Object.entries(snap.val());

		let rows = afterTs != null && afterId ? entries.slice(1) : entries;
		const hasMore = rows.length > limit;
		if (hasMore) rows = rows.slice(0, limit);

		const items = rows.map(([id, data]) => ({
			id,
			...data,
			canDelete: data.uid === currentUserId || postOwnerId === currentUserId,
		}));

		const last = items[items.length - 1];
		const next = hasMore && last ? { afterTs: last.createdAtMs, afterId: last.id } : null;

		return res.json({ items, next });
	} catch (err) {
		console.error('getCommentsPage error:', err);
		return res.status(500).json({ errorCode: 'server-error', message: 'Failed to load comments' });
	}
}

// @route   POST /posts/:postId/likes
// @desc    Adds a like from the current user; returns { likeCount, isLiked: true }
export async function addLike(req, res) {
	try {
		const { postId } = req.params;
		const userId = req.session.userId;

		const postRef = ref(db, `posts/${postId}`);
		const postSnap = await get(postRef);
		if (!postSnap.exists()) return res.status(404).json({ error: 'Post not found' });

		const userLikeRef = ref(db, `users/${userId}/likes/${postId}`);
		const postUserLikeRef = ref(db, `posts/${postId}/likes/${userId}`);
		const likeCountRef = ref(db, `posts/${postId}/likeCount`);

		const likedSnap = await get(userLikeRef);
		const alreadyLiked = likedSnap.exists();

		if (!alreadyLiked) {
			await Promise.all([set(userLikeRef, true), set(postUserLikeRef, true)]);
			await runTransaction(likeCountRef, (count) => {
				count = Number.isFinite(count) ? count : 0;
				return count + 1;
			});
		}

		const finalCountSnap = await get(likeCountRef);
		const likeCount = Number(finalCountSnap.val()) || 0;
		return res.json({ likeCount, isLiked: true });
	} catch (err) {
		console.error('Error adding like:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}

// @route   DELETE /posts/:postId/likes
// @desc    Removes the current user's like; returns { likeCount, isLiked: false }
export async function removeLike(req, res) {
	try {
		const { postId } = req.params;
		const userId = req.session.userId;

		const postRef = ref(db, `posts/${postId}`);
		const postSnap = await get(postRef);
		if (!postSnap.exists()) return res.status(404).json({ error: 'Post not found' });

		const userLikeRef = ref(db, `users/${userId}/likes/${postId}`);
		const postUserLikeRef = ref(db, `posts/${postId}/likes/${userId}`);
		const likeCountRef = ref(db, `posts/${postId}/likeCount`);

		const likedSnap = await get(userLikeRef);
		const isLiked = likedSnap.exists();

		if (isLiked) {
			await Promise.all([remove(userLikeRef), remove(postUserLikeRef)]);
			await runTransaction(likeCountRef, (count) => {
				count = Number.isFinite(count) ? count : 0;
				return Math.max(0, count - 1);
			});
		}

		const finalCountSnap = await get(likeCountRef);
		const likeCount = Number(finalCountSnap.val()) || 0;
		return res.json({ likeCount, isLiked: false });
	} catch (err) {
		console.error('Error removing like:', err);
		return res.status(500).json({ error: 'Internal Server Error' });
	}
}
