import { db } from '../config/firebaseConfig.js'
import { ref, query, orderByChild, get, equalTo } from 'firebase/database'

async function checkDuplicate(field, value) {
    const userRef = ref(db, 'users')
    const snapshot = await get(query(userRef, orderByChild(field), equalTo(value)))
    return snapshot.exists()
}

export async function validateSignUp(user, error) {
    let invalidFields = {
        invalidUsername: false,
        invalidEmail: false,
        invalidPassword: false,
    }

    if (await checkDuplicate('username', user.username)) invalidFields.invalidUsername = true

    if (error === 'auth/email-already-in-use') invalidFields.invalidEmail = true

    if (error === 'auth/weak-password') invalidFields.invalidPassword = true

    return invalidFields
}
