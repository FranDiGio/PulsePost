import validator from "validator";
import { db } from "../config/firebaseConfig.js"
import { ref, query, orderByChild, get, equalTo } from 'firebase/database';

async function checkDuplicate(field, value) {
    const userRef = ref(db, 'users');
    const userQuery = query(userRef, orderByChild(field), equalTo(value));
    const snapshot = await get(userQuery);
    return snapshot.exists();
}

export async function validateSignUp(user) {
    let invalidFields = {
        invalidUsername: false,
        invalidEmail: false,
        invalidPassword: false
    };    

    if (await checkDuplicate('username', user.username))
        invalidFields.invalidUsername = true;

    if (await checkDuplicate('email', user.email))
        invalidFields.invalidEmail = true;

    if (!validator.isStrongPassword(user.password, { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }))
        invalidFields.invalidPassword = true;

    return invalidFields;
}