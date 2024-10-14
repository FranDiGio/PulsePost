import { db } from '../config/firebaseConfig.js';
import { ref, get } from 'firebase/database';

export async function getUserData(userId) {
	const userRef = ref(db, `users/${userId}`);
	const userSnapshot = await get(userRef);
	const userData = userSnapshot.val();

	return { userData, userRef };
}
