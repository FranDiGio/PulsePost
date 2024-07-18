import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import { isStrongPassword } from './services/userService.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { User } from './models/User.mjs';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, query, orderByChild, get, equalTo } from 'firebase/database';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
let usersLocalList = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: '9qB7n!4@F#5ZwpUJ*3Hg',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' }
}));

app.listen(port, () => {
    console.log('Listening to port ' + port);
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/feed/', (req, res) => {
    res.render('feed.ejs', { username: req.session.username });
});

app.get('/about/', (req, res) => {
    res.render('about.ejs');
});

app.get('/contact/', (req, res) => {
    res.render('contact.ejs');
});

app.get('/signup/', (req, res) => {
    res.render('sign-up.ejs', { success: false });
});

app.get('/login/', (req, res) => {
    res.render('log-in.ejs');
});

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const userRef = ref(db, 'users');
    let invalidField = "none";

    // Duplicate username check-up
    const usernameSnapshot = await get(query(userRef, orderByChild('username'), equalTo(username)));
    if (usernameSnapshot.exists()) {
        invalidField = "username";
    }

    // Duplicate email check-up
    const emailSnapshot = await get(query(userRef, orderByChild('email'), equalTo(email)));
    if (emailSnapshot.exists()) {
        invalidField = "email";
    }

    if (invalidField === "username") {
        res.render('sign-up.ejs', { success: false, invalidUsername: true });
    } 
    else if (invalidField === "email") {
        res.render('sign-up.ejs', { success: false, invalidEmail: true });
    } 
    else if (!isStrongPassword(password)) {
        res.render('sign-up.ejs', { success: false, invalidPassword: true });
    } 
    else {
        const newUser = new User(username, email, password);
        req.session.username = newUser.username;
        const userID = push(ref(db, 'users'));
        set(userID, {
            username: newUser.username,
            email: newUser.email,
            password: newUser.password
        })
        .then(() => {
            res.render('sign-up.ejs', { success: true });
        })
        .catch((error) => {
            console.log('Error on sign-up: ' + error);
            res.render('sign-up.ejs', { success: false });
        });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const userRef = ref(db, 'users');
    const userQuery = query(userRef, orderByChild('email'), equalTo(email));

    get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
            const user = snapshot.val();
            console.log(user);
            res.redirect('/feed/');
        }
        else {
            res.render('log-in.ejs', { invalid: true });
        }
    });
});
