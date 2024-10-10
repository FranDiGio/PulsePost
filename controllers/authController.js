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

	signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			const user = userCredential.user;
			const usersRef = ref(db, 'users/' + user.uid);

			update(usersRef, {
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
		})
		.catch((error) => {
			res.render('log-in.ejs', {
				invalidCredentials: true,
				email: email,
			});
			console.error(error.message);
		});
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
