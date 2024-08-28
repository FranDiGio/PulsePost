import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { ref, set, child, get, update } from 'firebase/database'
import { auth, db } from '../config/firebaseConfig.js'
import { getFormattedDateTime } from './dateService.js'
import { validateSignUp, checkValidUsername } from './userService.js'

export function ensureAuthenticated(req, res, next) {
    if (req.session.username) {
        return next()
    } else {
        res.redirect('/login')
    }
}

export async function signUp(req, res) {
    const { username, email, password } = req.body
    const newUser = { username, email, password }

    try {
        const usernameError = await checkValidUsername(username)
        if (usernameError) throw new Error(usernameError)

        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        req.session.username = username
        req.session.userId = user.uid

        await set(ref(db, 'users/' + user.uid), {
            username: username,
            bio: "I'm new here! be nice ;-;",
            profilePicture: 'N/A',
            createdAt: getFormattedDateTime(),
            lastLogged: getFormattedDateTime(),
            following: [],
            followers: [],
        })

        res.render('sign-up.ejs', { success: true })
    } catch (error) {
        const validationResult = await validateSignUp(newUser, error.code)
        res.render('sign-up.ejs', {
            success: false,
            ...validationResult.invalidFields,
            ...validationResult.invalidMessages,
            username,
            email,
        })
        console.log(error.message)
    }
}

export function login(req, res) {
    const { email, password } = req.body

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user
            const usersRef = ref(db, 'users/' + user.uid)

            update(usersRef, {
                lastLogged: getFormattedDateTime(),
            })

            get(child(usersRef, `username`)).then((snapshot) => {
                if (snapshot.exists()) {
                    req.session.username = snapshot.val()
                    req.session.userId = user.uid
                    res.redirect('/feed/')
                } else {
                    console.log('No data available')
                    res.redirect('/login')
                }
            })
        })
        .catch((error) => {
            res.render('log-in.ejs', {
                invalidCredentials: true,
                email: email,
            })
            console.log(error.message)
        })
}

export function logOut(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Unable to sign out')
        }
        signOut(auth).then(() => {
            console.log('Sign-out successful')
        })
        res.redirect('/login')
    })
}

export async function submitPost(req, res) {
    const { title, content } = req.body
    const userId = req.session.userId

    await set(ref(db, 'users/' + userId + '/posts/'), {
        title: title,
        content: content,
        createdAt: getFormattedDateTime(),
    })

    res.redirect('/feed')
}
