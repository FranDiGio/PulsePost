import { db } from '../config/firebaseConfig.js';
import ValidationResult from '../models/ValidationResult.mjs';

export async function checkValidUsername(username) {
    if (!username) return "Username field can't be empty";
    if (username.length > 15) return 'Username is too long';

    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('username').equalTo(username).once('value');

    return snapshot.exists() ? 'Username already exists' : null;
}

export async function validateSignUp(user, error) {
    const validationResult = new ValidationResult();
    const usernameError = await checkValidUsername(user.username);

    if (usernameError) {
        validationResult.setInvalid('Username', usernameError);
    } else {
        switch (error) {
            case 'auth/email-already-in-use':
                break;
            case 'auth/invalid-email':
                validationResult.setInvalid('Email', 'Invalid email format');
                break;
            case 'auth/missing-email':
                break;
            case 'auth/weak-password':
                validationResult.setInvalid('Password', 'Password should be at least 6 characters long');
                break;
            case 'auth/missing-password':
                validationResult.setInvalid('Password', 'Password is required');
                break;
            default:
                break;
        }
    }

    return validationResult;
}