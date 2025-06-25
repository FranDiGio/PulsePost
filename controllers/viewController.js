import { getLatestPosts, getUserPosts } from './postController.js';
import { getFollowStatsById } from './followController.js';
import { getUserData } from '../services/userService.js';
import { db } from '../config/firebaseConfig.js';
import { ref, get } from 'firebase/database';

// @route   GET /feed
// @desc    Loads the main feed with current user's details and latest posts
export async function loadFeed(req, res) {
	try {
		const userId = req.session.userId;
		const userPictureUrl = await getProfilePictureUrl(userId);
		const userBackgroundUrl = await getProfileBackgroundUrl(userId);
		const userBio = await getBiography(userId);
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
		const userPictureUrl = await getProfilePictureUrl(userId);
		const userBackgroundUrl = await getProfileBackgroundUrl(userId);
		const userBio = await getBiography(userId);

		// Selected profile
		const username = req.params.username;
		const sanitizedUsername = username.trim().toLowerCase();
		const idSnapshot = await get(ref(db, `usernames/` + sanitizedUsername));
		const profileId = idSnapshot.val();

		// Check if selected profile = current user
		let isSelf = false;
		if (req.session.username === req.params.username) {
			isSelf = true;
		}

		if (profileId == null) {
			res.status(404).render('error.ejs', { error: '404: Page Not Found' });
		} else {
			const profilePictureUrl = await getProfilePictureUrl(profileId);
			const profileBackgroundUrl = await getProfileBackgroundUrl(profileId);
			const profileBio = await getBiography(profileId);
			const posts = await getUserPosts(profileId);
			const { followersCount, followingCount } = await getFollowStatsById(profileId);
			const profileStats = { followers: followersCount, following: followingCount };

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
				posts: posts,
			});
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.status(500).render('error.ejs', { error: '500: Failed to load page' });
	}
}

// @helper
// @desc    Retrieves profile picture URL or default
async function getProfilePictureUrl(userId) {
	try {
		const { userData } = await getUserData(userId);

		if (userData && userData.profilePicture && userData.profilePicture !== 'N/A') {
			return userData.profilePicture;
		} else {
			return '/images/default-profile.png';
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		return '/images/default-profile.png';
	}
}

// @helper
// @desc    Retrieves profile background URL or default
async function getProfileBackgroundUrl(userId) {
	try {
		const { userData } = await getUserData(userId);

		if (userData && userData.profileBackground && userData.profileBackground !== 'N/A') {
			return userData.profileBackground;
		} else {
			return '/images/default-background.png';
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		return '/images/default-background.png';
	}
}

// @helper
// @desc    Retrieves biography text for a given user
async function getBiography(userId) {
	try {
		const { userData } = await getUserData(userId);

		if (userData && userData.bio) {
			return userData.bio;
		} else {
			return '';
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		return '';
	}
}
