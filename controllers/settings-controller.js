import { auth, db, bucket } from '../config/firebase-config.js';
import { updatePassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { update, remove, ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { getUserData } from '../services/user-service.js';
import { getFilename } from '../services/file-service.js';
import { getPostLikes } from '../services/post-service.js';
import { validateNewPassword } from '../services/validation-service.js';
import { getFollowersList, getFollowingList } from '../services/follow-service.js';

// @route   POST /picture
// @desc    Uploads a new profile picture and updates the user's profile
export async function uploadProfilePicture(req, res) {
	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}
	const userId = req.session.userId;

	const filename = getFilename(req.file.mimetype, 'picture', req.session.username);
	const file = bucket.file(`profile_pictures/${req.session.userId}/${filename}`);
	const stream = file.createWriteStream({
		metadata: {
			contentType: req.file.mimetype,
		},
	});

	stream.on('error', (error) => {
		console.error('Error uploading file:', error);
		res.status(500).send('Error uploading file');
	});

	stream.on('finish', async () => {
		await file.makePublic();

		const downloadUrl = await file.getSignedUrl({
			action: 'read',
			expires: '03-09-2491',
		});

		const { userRef } = await getUserData(userId);
		update(userRef, {
			profilePicture: downloadUrl[0],
		})
			.then(() => {
				res.status(200).send('File uploaded successfully');
			})
			.catch((error) => {
				console.error('Error updating profile picture:', error);
				res.status(500).send('Error updating profile picture');
			});
	});

	stream.end(req.file.buffer);
}

// @route   DELETE /picture
// @desc    Deletes the user's profile picture from DB and storage
export async function deleteProfilePicture(req, res) {
	const userId = req.session.userId;

	try {
		const { userData, userRef } = await getUserData(userId);

		if (!userData || !userData.profilePicture) {
			return res.status(404).send('No profile picture found for this user.');
		}

		// Delete the profile picture URL in Realtime Database
		await update(userRef, {
			profilePicture: null,
		});

		// Delete the directory in Firebase Storage
		const directoryPath = `profile_pictures/${userId}`;
		await bucket.deleteFiles({
			prefix: directoryPath,
		});

		res.status(200).send('Profile picture deleted successfully');
	} catch (error) {
		console.error('Error deleting profile picture:', error);
		res.status(500).send('Error deleting profile picture');
	}
}

// @route   POST /background
// @desc    Uploads a new profile background and updates the user's profile
export async function uploadProfileBackground(req, res) {
	const userId = req.session.userId;

	if (!req.file) {
		return res.status(400).send('No file uploaded.');
	}

	const filename = getFilename(req.file.mimetype, 'background', req.session.username);
	const file = bucket.file(`profile_backgrounds/${req.session.userId}/${filename}`);
	const stream = file.createWriteStream({
		metadata: {
			contentType: req.file.mimetype,
		},
	});

	stream.on('error', (error) => {
		console.error('Error uploading file:', error);
		res.status(500).send('Error uploading file');
	});

	stream.on('finish', async () => {
		await file.makePublic();

		const downloadUrl = await file.getSignedUrl({
			action: 'read',
			expires: '03-09-2491',
		});

		const { userRef } = await getUserData(userId);
		update(userRef, {
			profileBackground: downloadUrl[0],
		})
			.then(() => {
				res.status(200).send('File uploaded successfully');
			})
			.catch((error) => {
				console.error('Error updating profile picture:', error);
				res.status(500).send('Error updating profile picture');
			});
	});

	stream.end(req.file.buffer);
}

// @route   DELETE /background
// @desc    Deletes the user's profile background from DB and storage
export async function deleteProfileBackground(req, res) {
	const userId = req.session.userId;

	try {
		const { userData, userRef } = await getUserData(userId);

		if (!userData || !userData.profileBackground) {
			return res.status(404).send('No profile background found for this user.');
		}

		// Delete the profile background URL in Realtime Database
		await update(userRef, {
			profileBackground: null,
		});

		// Delete the directory in Firebase Storage
		const directoryPath = `profile_backgrounds/${userId}`;
		await bucket.deleteFiles({
			prefix: directoryPath,
		});

		res.status(200).send('Profile background deleted successfully');
	} catch (error) {
		console.error('Error deleting profile background:', error);
		res.status(500).send('Error deleting profile background');
	}
}

// @route   PUT /bio
// @desc    Updates the user's biography
export async function updateBiography(req, res) {
	const userId = req.session.userId;

	try {
		const { userData, userRef } = await getUserData(userId);

		if (!userData) {
			return res.status(404).send('No data found for this user.');
		}

		await update(userRef, {
			bio: req.body.bioContent,
		});

		res.status(200).send('Bio updated succesfully');
	} catch (error) {
		console.error('Error updating biography:', error);
		res.status(500).send('Error updating biography');
	}
}

// @route   PUT /password
// @desc    Resets the user's password after validating current password
export async function resetPassword(req, res) {
	const userId = req.session.userId;

	try {
		const { userData } = await getUserData(userId);

		// Authenticate user with current password
		await signInWithEmailAndPassword(auth, userData.email, req.body.currentPassword);

		// Validate new password format
		const error = validateNewPassword(req.body.newPassword, req.body.confirmNewPassword);

		if (error) {
			return res.status(400).json({ newPassword: `${error}` });
		}

		const user = auth.currentUser;
		await updatePassword(user, req.body.newPassword);
		return res.status(200).json({ message: 'Password updated successfully' });
	} catch (error) {
		console.error('Error updating password:', error.code);

		if (error.code === 'auth/invalid-credential' || error.code === 'auth/missing-password') {
			return res.status(400).json({ currentPassword: 'Current password is incorrect' });
		}

		return res.status(500).json({ error: 'Error updating password' });
	}
}

// @route   DELETE /account
// @desc    Deletes the user's account, posts, DB entries, and storage files
export async function deleteAccount(req, res) {
	const userId = req.session.userId;

	try {
		const { userData, userRef } = await getUserData(userId);
		const username = userData.username.toLowerCase();
		const user = auth.currentUser;

		if (!user) {
			return res.status(401).send('User not authenticated.');
		}

		const postsRef = ref(db, 'posts');
		const postsQuery = query(postsRef, orderByChild('uid'), equalTo(userId));
		const snapshot = await get(postsQuery);

		// Remove existing posts from this user
		if (snapshot.exists()) {
			const postsData = snapshot.val();

			for (const postKey in postsData) {
				if (postsData.hasOwnProperty(postKey)) {
					const likedBy = await getPostLikes(postKey);

					// Remove the like reference from each user's likes list
					for (const likerId of likedBy) {
						const userLikeRef = ref(db, `users/${likerId}/likes/${postKey}`);
						await remove(userLikeRef);
						console.log(`Removed like reference to post ${postKey} from user ${likerId}`);
					}

					// Delete the post and comments
					const postRef = ref(db, `posts/${postKey}`);
					const commentsRef = ref(db, `comments/${postKey}`);

					await remove(postRef);
					await remove(commentsRef);
					console.log(`Post ${postKey} deleted successfully.`);
				}
			}
		} else {
			console.log('No posts found for this user.');
		}

		// Remove existing following/followers references from this user
		const followers = await getFollowersList(userId);
		const following = await getFollowingList(userId);

		const removeFollowers = followers.map(async (uid) => {
			const refToRemove = ref(db, `users/${uid}/following/${userId}`);
			const snap = await get(refToRemove);
			if (snap.exists()) {
				await remove(refToRemove);
				console.log(`Removed ${userId} from ${uid}'s following`);
			}
		});

		const removeFollowing = following.map(async (uid) => {
			const refToRemove = ref(db, `users/${uid}/followers/${userId}`);
			const snap = await get(refToRemove);
			if (snap.exists()) {
				await remove(refToRemove);
				console.log(`Removed ${userId} from ${uid}'s followers`);
			}
		});

		await Promise.all([...removeFollowers, ...removeFollowing]);

		// Remove main user data and reference
		await remove(ref(db, `usernames/${username}`));
		await remove(userRef);
		await deleteUser(user);

		await bucket.deleteFiles({
			prefix: `profile_backgrounds/${userId}`,
		});

		await bucket.deleteFiles({
			prefix: `profile_pictures/${userId}`,
		});

		return res.status(200).json({ message: 'Account deleted successfully' });
	} catch (error) {
		console.error('Error deleting account:', error.message || error);
		return res.status(500).json({ error: 'Error deleting account' });
	}
}
