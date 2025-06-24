import { getUserData } from '../services/userService.js';
import { db } from '../config/firebaseConfig.js';
import { ref, get } from 'firebase/database';

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
			const posts = await getUserPosts(userId);

			res.render('profile.ejs', {
				username: req.session.username,
				userPictureUrl: userPictureUrl,
				userBackgroundUrl: userBackgroundUrl,
				userBio: userBio,
				profileUsername: req.params.username,
				profilePictureUrl: profilePictureUrl,
				profileBackgroundUrl: profileBackgroundUrl,
				profileBio: profileBio,
				isSelf: isSelf,
				posts: posts,
			});
		}
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.status(500).render('error.ejs', { error: '500: Failed to load page' });
	}
}

async function getLatestPosts(userId) {
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

async function getUserPosts(userId) {
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
