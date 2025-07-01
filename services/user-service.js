import { db } from '../config/firebase-config.js';
import { ref, get } from 'firebase/database';

// @desc    Retrieves data and reference for a specific user
export async function getUserData(userId) {
	const userRef = ref(db, `users/${userId}`);
	const userSnapshot = await get(userRef);
	const userData = userSnapshot.val();

	return { userData, userRef };
}

// @desc    Validates and resolves a username to UID
export async function getIdFromUsername(username) {
	if (typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
		return { error: 'Invalid username format.' };
	}

	const sanitized = username.trim().toLowerCase();
	const snap = await get(ref(db, `usernames/${sanitized}`));
	const uid = snap.val();

	if (!uid) return { error: 'User not found.' };

	return { uid };
}

// @desc    Retrieves profile picture URL or default
export async function getProfilePictureUrl(userId) {
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

// @desc    Retrieves profile background URL or default
export async function getProfileBackgroundUrl(userId) {
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

// @desc    Retrieves biography text for a given user
export async function getUserBiography(userId) {
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
