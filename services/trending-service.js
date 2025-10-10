import { ref, get, query, update, orderByChild, limitToLast } from 'firebase/database';
import { db } from '../config/firebase-config.js';

export const TRENDING_CFG = {
	wL: 1,
	wC: 2,
	halfLifeHours: 24,
	epsilon: 0.05, // fresh zero-engagement posts
};

// @desc    Compute trend score for a post given its metrics and age.
export function computeTrendScore({ likes = 0, comments = 0, createdAtMs }, nowMs = Date.now(), cfg = TRENDING_CFG) {
	const { wL, wC, halfLifeHours, epsilon } = cfg;
	const ageHours = Math.max(0, (nowMs - createdAtMs) / 3_600_000);
	const engagement = wL * Math.log1p(likes) + wC * Math.log1p(comments);
	const decay = Math.exp(-ageHours / halfLifeHours);
	return (engagement + epsilon) * decay;
}

// @desc    Recompute and persist trend score after an engagement change
export async function recalcAndUpdateTrend(postId) {
	const postRef = ref(db, `posts/${postId}`);
	const snap = await get(postRef);
	if (!snap.exists()) return;

	const p = snap.val();
	const nowMs = Date.now();

	const score = computeTrendScore(
		{
			likes: Number(p.likeCount) || 0,
			comments: Number(p.commentCount) || 0,
			createdAtMs: Number(p.createdAtMs) || nowMs,
		},
		nowMs,
	);

	await update(postRef, {
		trendScore: score,
		trendScoreUpdatedAt: nowMs,
	});
}

// @desc Retrieves "trending" posts by computed score
export async function fetchTrendingPostsPage(userId, pageSize = 5, { afterId = null, fetchLimit = 500 } = {}) {
	const DEFAULT_PIC = '/images/default-profile.png';

	try {
		const snap = await get(query(ref(db, 'posts'), orderByChild('createdAtMs'), limitToLast(fetchLimit)));
		if (!snap.exists()) return { items: [], nextCursor: null };

		const now = Date.now();

		// Array-ify + compute score
		const rows = Object.entries(snap.val()).map(([id, post]) => {
			const trendScoreComputed = computeTrendScore(
				{
					likes: post.likeCount || 0,
					comments: post.commentCount || 0,
					createdAtMs: post.createdAtMs || now,
				},
				now,
			);
			return { id, trendScoreComputed, ...post };
		});

		// Sort by score desc, then createdAtMs desc
		rows.sort((a, b) => {
			if (b.trendScoreComputed !== a.trendScoreComputed) {
				return b.trendScoreComputed - a.trendScoreComputed;
			}
			return (b.createdAtMs || 0) - (a.createdAtMs || 0);
		});

		// Offset-based pagination with afterId
		let startIdx = 0;
		if (afterId) {
			const idx = rows.findIndex((r) => r.id === afterId);
			startIdx = idx >= 0 ? idx + 1 : 0;
		}

		const page = rows.slice(startIdx, startIdx + pageSize);

		// Post decoration
		const [likedSnap, followingSnap] = await Promise.all([
			get(ref(db, `users/${userId}/likes`)),
			get(ref(db, `users/${userId}/following`)),
		]);
		const likedSet = new Set(Object.keys(likedSnap.val() || {}));
		const followingSet = new Set(Object.keys(followingSnap.val() || {}));

		const authorIds = new Set(page.map((p) => p.uid).filter(Boolean));
		const profilePicByUid = new Map();
		await Promise.all(
			[...authorIds].map(async (aid) => {
				const picSnap = await get(ref(db, `users/${aid}/profilePicture`));
				const pic = picSnap.val();
				profilePicByUid.set(aid, pic && pic !== 'N/A' ? pic : DEFAULT_PIC);
			}),
		);

		for (const post of page) {
			const authorUid = post.uid;
			post.profilePictureUrl = authorUid ? profilePicByUid.get(authorUid) || DEFAULT_PIC : DEFAULT_PIC;
			post.isLikedByCurrentUser = likedSet.has(post.id);
			post.isFollowedByCurrentUser =
				authorUid === userId ? null : authorUid ? followingSet.has(authorUid) : false;
		}

		const last = page[page.length - 1];
		const nextCursor = page.length < pageSize ? null : (last?.id ?? null);

		return { items: page, nextCursor };
	} catch (err) {
		console.error('fetchTrendingPostsPage error', err);
		return { items: [], nextCursor: null };
	}
}
