import { ref, get, update } from 'firebase/database';
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
