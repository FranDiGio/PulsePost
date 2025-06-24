import { ref, query, orderByChild, equalTo, get } from 'firebase/database';
import { db } from '../config/firebaseConfig.js';
import UserValidationResult from '../models/UserValidationResult.mjs';

export async function checkValidUsername(username) {
	if (!username) return "Username field can't be empty";
	if (username.length > 15) return 'Username is too long';

	const usernameKey = username.trim().toLowerCase();

	try {
		const snapshot = await get(ref(db, `usernames/${usernameKey}`));
		return snapshot.exists() ? 'Username already exists' : null;
	} catch (error) {
		console.error('Error checking username:', error);
		return 'Error checking username';
	}
}

export async function validateSignUp(user, error) {
	const userValidationResult = new UserValidationResult();
	const usernameError = await checkValidUsername(user.username);

	if (usernameError) {
		userValidationResult.setInvalid('Username', usernameError);
	} else {
		switch (error) {
			case 'auth/email-already-in-use':
				userValidationResult.setInvalid('Email', 'Email already in use');
				break;
			case 'auth/invalid-email':
				userValidationResult.setInvalid('Email', 'Invalid email format');
				break;
			case 'auth/missing-email':
				userValidationResult.setInvalid('Email', 'Missing email');
				break;
			case 'auth/weak-password':
				userValidationResult.setInvalid('Password', 'Password should be at least 6 characters long');
				break;
			case 'auth/missing-password':
				userValidationResult.setInvalid('Password', 'Password is required');
				break;
			default:
				break;
		}
	}

	return userValidationResult;
}

export function validateNewPassword(newPassword, confirmPassword) {
	let passwordError;

	if (newPassword.length < 6) {
		passwordError = 'Password should be at least 6 characters long';
	} else if (newPassword !== confirmPassword) {
		passwordError = 'Passwords do not match';
	} else {
		passwordError = null;
	}

	return passwordError;
}
