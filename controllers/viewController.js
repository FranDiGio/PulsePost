import { getUserData } from '../services/userService.js';
import { db } from '../config/firebaseConfig.js';
import { ref, get } from 'firebase/database';

export async function loadFeed(req, res) {
	try {
		const userId = req.session.userId;

		const profilePictureUrl = await getProfilePictureUrl(userId);
		const profileBackgroundUrl = await getProfileBackgroundUrl(userId);
		const bio = await getBiography(userId);
		const posts = await getLatestPosts();

		await res.render('feed.ejs', {
			username: req.session.username,
			profilePictureUrl: profilePictureUrl,
			profileBackgroundUrl: profileBackgroundUrl,
			bio: bio,
			posts: posts,
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.redirect('/login');
	}
}

export async function loadProfile(req, res) {
	try {
		const idSnapshot = await get(ref(db, `usernames/` + req.params.username));
		const userId = idSnapshot.val();

		const profilePictureUrl = await getProfilePictureUrl(userId);
		const profileBackgroundUrl = await getProfileBackgroundUrl(userId);
		const bio = await getBiography(userId);
		const posts = await getUserPosts(userId);

		res.render('profile.ejs', {
			username: req.params.username,
			profilePictureUrl: profilePictureUrl,
			profileBackgroundUrl: profileBackgroundUrl,
			bio: bio,
			posts: posts,
		});
	} catch (error) {
		console.error('Error fetching user data:', error);
		res.redirect('/login');
	}
}

async function getLatestPosts() {
	try {
		const postsRef = ref(db, `posts`);
		const postsSnapshot = await get(postsRef);
		const postsData = postsSnapshot.val();

		// Fetch profile picture for each post's author
		for (const key in postsData) {
			if (postsData.hasOwnProperty(key)) {
				const post = postsData[key];
				const profilePictureUrl = await getProfilePictureUrl(post.uid);
				post.profilePictureUrl = profilePictureUrl;
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
