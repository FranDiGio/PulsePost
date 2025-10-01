import { getLatestPosts, getUserPostCount, fetchUserPostsPage } from '../services/post-service.js';
import { getFollowStatsById } from '../services/follow-service.js';
import {
	getUserProfilePictureUrl,
	getUserProfileBackgroundUrl,
	getUserBiography,
	getUserData,
} from '../services/user-service.js';
import { db } from '../config/firebase-config.js';
import { ref, get } from 'firebase/database';

// @route   GET /feed
// @desc    Loads the main feed with current user's details and latest posts
export async function loadFeed(req, res) {
	try {
		const userId = req.session.userId;
		const { userData } = await getUserData(userId);
		const userPictureUrl = await getUserProfilePictureUrl(userData);
		const userBackgroundUrl = await getUserProfileBackgroundUrl(userData);
		const userBio = await getUserBiography(userData);
		const posts = await getLatestPosts(userId);

		await res.render('feed.ejs', {
			username: req.session.username,
			userId: userId,
			userPictureUrl: userPictureUrl,
			userBackgroundUrl: userBackgroundUrl,
			userBio: userBio,
			posts: posts,
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.status(500).render('error', { error: '500: Failed to load page' });
	}
}

// @route   GET /profile/:username
// @desc    Loads profile page for selected username (self or other user)
export async function loadProfile(req, res) {
	try {
		// Current user
		const userId = req.session.userId;
		const { userData } = await getUserData(userId);
		const userPictureUrl = await getUserProfilePictureUrl(userData);
		const userBackgroundUrl = await getUserProfileBackgroundUrl(userData);
		const userBio = await getUserBiography(userData);

		// Selected user
		const username = req.params.username;
		const sanitizedUsername = username.trim().toLowerCase();
		const idSnapshot = await get(ref(db, `usernames/` + sanitizedUsername));
		const profileId = idSnapshot.val();

		// Check if selected user = current user
		let isSelf = false;
		if (req.session.username === req.params.username) {
			isSelf = true;
		}

		// Check if current user follows the selected user
		let isFollowing = false;
		if (!isSelf) {
			const followSnap = await get(ref(db, `users/${userId}/following/${profileId}`));
			isFollowing = followSnap.exists();
		}

		if (profileId == null) {
			res.status(404).render('error.ejs', { error: '404: Page Not Found' });
		} else {
			const { userData: profileData } = await getUserData(profileId);
			const profilePictureUrl = await getUserProfilePictureUrl(profileData);
			const profileBackgroundUrl = await getUserProfileBackgroundUrl(profileData);
			const profileBio = await getUserBiography(profileData);

			// First page of posts
			const firstPageSize = 5;
			const { items: firstItems, nextCursor } = await fetchUserPostsPage(
				profileId,
				userId,
				firstPageSize,
				Number.MAX_SAFE_INTEGER,
			);

			// Convert array to object keyed by id
			const posts = firstItems.reduce((acc, post) => {
				acc[post.id] = post;
				return acc;
			}, {});

			// Profile Stats
			const { followersCount, followingCount } = await getFollowStatsById(profileId);
			const postCount = await getUserPostCount(profileId);
			const profileStats = { followers: followersCount, following: followingCount, posts: postCount };

			res.render('profile.ejs', {
				username: req.session.username,
				userPictureUrl: userPictureUrl,
				userBackgroundUrl: userBackgroundUrl,
				userBio: userBio,
				profileUsername: req.params.username,
				profilePictureUrl: profilePictureUrl,
				profileBackgroundUrl: profileBackgroundUrl,
				profileBio: profileBio,
				profileStats: profileStats,
				isSelf: isSelf,
				isFollowing: isFollowing,
				posts: posts,
				profileId: profileId,
				nextCursor: nextCursor,
			});
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.status(500).render('error.ejs', { error: '500: Failed to load page' });
	}
}
