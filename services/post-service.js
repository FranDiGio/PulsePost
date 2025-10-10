import { ref, get, query, orderByChild, limitToLast, endAt } from 'firebase/database';
import { db } from '../config/firebase-config.js';

// @desc Retrieves latest posts by page size
export async function fetchLatestPostsPage(userId, pageSize = 5, beforeTs = Number.MAX_SAFE_INTEGER) {
	const DEFAULT_PIC = '/images/default-profile.png';

	try {
		// Get page + 1 to detect "has more"
		const snap = await get(
			query(ref(db, 'posts'), orderByChild('createdAtMs'), endAt(beforeTs), limitToLast(pageSize + 1)),
		);

		if (!snap.exists()) return { items: [], nextCursor: null };

		// Turn object into array and sort ascending
		const rowsAsc = Object.entries(snap.val())
			.map(([id, data]) => ({ id, ...data }))
			.sort((a, b) => a.createdAtMs - b.createdAtMs);

		// If pageSize+1 fetched, drop the oldest one
		const hasMore = rowsAsc.length > pageSize;
		const pageAsc = hasMore ? rowsAsc.slice(rowsAsc.length - pageSize) : rowsAsc;

		// Convert to DESC
		const items = pageAsc.slice().reverse();

		// Preload current user's liked/following sets
		const [likedSnap, followingSnap] = await Promise.all([
			get(ref(db, `users/${userId}/likes`)),
			get(ref(db, `users/${userId}/following`)),
		]);
		const likedSet = new Set(Object.keys(likedSnap.val() || {}));
		const followingSet = new Set(Object.keys(followingSnap.val() || {}));

		// Unique author ids
		const authorIds = new Set(items.map((p) => p.uid).filter(Boolean));

		// Fetch each author's profile picture
		const profilePicByUid = new Map();
		await Promise.all(
			[...authorIds].map(async (aid) => {
				const picSnap = await get(ref(db, `users/${aid}/profilePicture`));
				const pic = picSnap.val();
				profilePicByUid.set(aid, pic && pic !== 'N/A' ? pic : DEFAULT_PIC);
			}),
		);

		// Decorate each item
		for (const post of items) {
			const authorUid = post.uid;
			post.profilePictureUrl = authorUid ? profilePicByUid.get(authorUid) || DEFAULT_PIC : DEFAULT_PIC;
			post.isLikedByCurrentUser = likedSet.has(post.id);
			post.isFollowedByCurrentUser =
				authorUid === userId ? null : authorUid ? followingSet.has(authorUid) : false;
		}

		// Cursor for next page (oldest item)
		const last = rowsAsc[0];
		const nextCursor = hasMore && last ? last.createdAtMs : null;

		return { items, nextCursor };
	} catch (err) {
		console.error('Error fetching posts:', err);
		return { items: [], nextCursor: null };
	}
}

// @desc  	Fetch a page of posts for a user, newest -> older, using createdAtMs as cursor
export async function fetchUserPostsPage(profileId, currentUserId, pageSize = 5, beforeTs = Number.MAX_SAFE_INTEGER) {
	try {
		// Read lightweight refs ordered by createdAtMs and ending at the cursor
		const lightSnap = await get(
			query(
				ref(db, `users/${profileId}/posts`),
				orderByChild('createdAtMs'),
				endAt(beforeTs),
				limitToLast(pageSize),
			),
		);
		if (!lightSnap.exists()) return { items: [], nextCursor: null };

		const lightMap = lightSnap.val();

		const orderedIds = Object.entries(lightMap)
			.sort(([, a], [, b]) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
			.map(([postId]) => postId);

		const likedSnap = await get(ref(db, `users/${currentUserId}/likes`));
		const likedSet = likedSnap.exists() ? new Set(Object.keys(likedSnap.val())) : new Set();

		const fullSnaps = await Promise.all(orderedIds.map((id) => get(ref(db, `posts/${id}`))));

		const items = fullSnaps.map((snap, idx) => {
			const postId = orderedIds[idx];
			const full = snap.val() || {};
			const light = lightMap[postId] || {};
			return {
				id: postId,
				...full,
				title: full.title ?? light.title ?? '',
				createdAtMs: full.createdAtMs ?? light.createdAtMs ?? 0,
				createdAtIso: full.createdAtIso ?? light.createdAtIso ?? null,
				isLikedByCurrentUser: likedSet.has(postId),
				likeCount: typeof full.likeCount === 'number' ? full.likeCount : 0,
				commentCount: typeof full.commentCount === 'number' ? full.commentCount : light.commentCount || 0,
			};
		});

		const oldest = items[items.length - 1];
		const nextCursor = items.length < pageSize ? null : (oldest?.createdAtMs ?? null);
		return { items, nextCursor };
	} catch (e) {
		console.error('fetchUserPostsPage error', e);
		return { items: [], nextCursor: null };
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
