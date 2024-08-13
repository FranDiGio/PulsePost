import { db } from '../config/firebaseConfig.js'
import { ref, query, orderByChild, get, equalTo } from 'firebase/database'

export async function checkValidUsername(username) {
    if (!username) {
        return "Username field can't be empty"
    }

    if (username.length > 20) {
        return 'Username is too long'
    }

    const userRef = ref(db, 'users')
    const snapshot = await get(query(userRef, orderByChild('username'), equalTo(username)))

    return snapshot.exists() ? 'Username already exists' : null
}

export async function validateSignUp(user, error, invalidFields) {
    let invalidMessages = {
        invalidEmailMsg: '',
        invalidPasswordMsg: '',
    }

    switch (error) {
        case 'auth/email-already-in-use':
            invalidFields.invalidEmail = true
            invalidMessages.invalidEmailMsg = 'Email already in use'
            break
        case 'auth/invalid-email':
            invalidFields.invalidEmail = true
            invalidMessages.invalidEmailMsg = 'Invalid email format'
            break
        case 'auth/missing-email':
            invalidFields.invalidEmail = true
            invalidMessages.invalidEmailMsg = 'Email is required'
            break
        case 'auth/weak-password':
            invalidFields.invalidPassword = true
            invalidMessages.invalidPasswordMsg = 'Password should be at least 6 characters long'
            break
        case 'auth/missing-password':
            invalidFields.invalidPassword = true
            invalidMessages.invalidPasswordMsg = 'Password is required'
            break
        default:
            break
    }

    return { invalidFields, invalidMessages }
}
