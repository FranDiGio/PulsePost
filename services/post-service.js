import { getUserProfilePictureUrl } from './user-service.js';
import { ref, get, query, orderByChild, limitToLast, endAt } from 'firebase/database';
import { db } from '../config/firebase-config.js';

// @desc Retrieves latest posts and decorates with: profilePictureUrl, isLikedByCurrentUser, isFollowedByCurrentUser
export async function getLatestPosts(userId) {
	const DEFAULT_PIC = '/images/default-profile.png';

	try {
		// Fetch all posts
		const postsSnap = await get(ref(db, 'posts'));
		const posts = postsSnap.val() || {};

		// Liked posts of current user
		const likedSnap = await get(ref(db, `users/${userId}/likes`));
		const likedSet = new Set(Object.keys(likedSnap.val() || {}));

		// Following list of current user
		const followingSnap = await get(ref(db, `users/${userId}/following`));
		const followingSet = new Set(Object.keys(followingSnap.val() || {}));

		// Unique authorIds from posts
		const authorIds = new Set(
			Object.values(posts)
				.map((p) => p.uid)
				.filter(Boolean),
		);

		// Fetch each author's profile picture once
		const profilePicByUid = new Map();
		await Promise.all(
			[...authorIds].map(async (aid) => {
				const picSnap = await get(ref(db, `users/${aid}/profilePicture`));
				const pic = picSnap.val();
				profilePicByUid.set(aid, pic && pic !== 'N/A' ? pic : DEFAULT_PIC);
			}),
		);

		// Decorate posts with computed fields
		for (const [postId, post] of Object.entries(posts)) {
			const authorUid = post.uid;

			post.profilePictureUrl = authorUid ? profilePicByUid.get(authorUid) || DEFAULT_PIC : DEFAULT_PIC;

			post.isLikedByCurrentUser = likedSet.has(postId);

			if (authorUid === userId) {
				post.isFollowedByCurrentUser = null;
			} else if (authorUid) {
				post.isFollowedByCurrentUser = followingSet.has(authorUid);
			} else {
				post.isFollowedByCurrentUser = false;
			}
		}

		return posts;
	} catch (err) {
		console.error('Error fetching posts:', err);
		return {};
	}
}

// @desc  Fetch a page of posts for a user, newest -> older, using createdAtMs as cursor
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
