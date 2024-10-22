import { auth, db } from '../config/firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { ref, set, update, get, child } from 'firebase/database';
import { getFormattedDateTime } from '../services/dateService.js';
import { validateSignUp, checkValidUsername } from '../services/validationService.js';

export function ensureAuthenticated(req, res, next) {
	if (req.session.username) {
		return next();
	} else {
		res.redirect('/login');
	}
}

export async function signUp(req, res) {
	const { username, email, password } = req.body;
	const newUser = { username, email, password };

	try {
		const usernameError = await checkValidUsername(username);
		if (usernameError) throw new Error(usernameError);

		const userCredential = await createUserWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		req.session.username = username;
		req.session.userId = user.uid;

		await set(ref(db, 'users/' + user.uid), {
			username: username,
			email: email,
			bio: "I'm new here! be nice ;-;",
			profilePicture: 'N/A',
			createdAt: getFormattedDateTime(),
			lastLogged: getFormattedDateTime(),
		});

		// Map the username to the userId
		await set(ref(db, 'usernames/' + username), user.uid);

		res.render('sign-up.ejs', { success: true });
	} catch (error) {
		const userValidationResult = await validateSignUp(newUser, error.code);
		res.render('sign-up.ejs', {
			success: false,
			...userValidationResult.invalidFields,
			...userValidationResult.invalidMessages,
			username,
			email,
		});
		console.log(error.message);
	}
}

export async function login(req, res) {
	const { email, password } = req.body;

	if (!req.session.failedAttempts) {
		req.session.failedAttempts = 0;
	}
	if (!req.session.blockedUntil) {
		req.session.blockedUntil = null;
	}

	const now = new Date();

	if (req.session.blockedUntil && now < new Date(req.session.blockedUntil)) {
		res.render('log-in.ejs', {
			invalidCredentials: true,
			email: email,
			message: 'Too many failed attempts. Try again later.',
		});
		return;
	}

	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password);
		const user = userCredential.user;
		const usersRef = ref(db, 'users/' + user.uid);

		req.session.failedAttempts = 0;
		req.session.blockedUntil = null;

		await update(usersRef, {
			lastLogged: getFormattedDateTime(),
		});

		get(child(usersRef, `username`)).then((snapshot) => {
			if (snapshot.exists()) {
				req.session.username = snapshot.val();
				req.session.userId = user.uid;
				res.redirect('/feed/');
			} else {
				console.log('No data available');
				res.redirect('/login');
			}
		});
	} catch (error) {
		req.session.failedAttempts += 1;

		if (req.session.failedAttempts >= 5) {
			req.session.blockedUntil = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // Block for 15 minutes
		}

		res.render('log-in.ejs', {
			invalidCredentials: true,
			email: email,
			message: 'Invalid email or password.',
		});
		console.error(error.message);
	}
}

export async function logOut(req, res) {
	try {
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).send('Unable to sign out');
			}
			res.redirect('/login');
		});
	} catch (error) {
		console.error('Error during sign-out:', error);
		res.status(500).send('Unable to sign out');
	}
}
