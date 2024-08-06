import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import { ref, set, push, query, orderByChild, get, equalTo } from 'firebase/database';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { validateSignUp } from './services/userService.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { User } from './models/User.mjs';
import { db, auth } from './config/firebaseConfig.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

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
    res.render('sign-up.ejs', { success: false, invalidUsername: false, invalidEmail: false, invalidPassword: false });
});

app.get('/login/', (req, res) => {
    res.render('log-in.ejs', { invalidCredentials: false });
});

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const newUser = new User(username, email, password);

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            res.render('sign-up.ejs', { success: true });
        })
        .catch(async (error) => {
            const invalidFields = await validateSignUp(newUser, error.code);

            if (Object.keys(invalidFields).length > 0){
                res.render('sign-up.ejs', { success: false, ...invalidFields });
            }

            console.log(error.message);
        });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const userRef = ref(db, 'users');
    const userQuery = query(userRef, orderByChild('email'), equalTo(email));

    get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
            const userSnapshot = snapshot.val();
            const userId = Object.keys(userSnapshot)[0];
            const user = userSnapshot[userId];

            if (password === user.password){
                res.redirect('/feed/');
            }
            else {
                res.render('log-in.ejs', { invalidCredentials: true });
            }
        }
        else {
            res.render('log-in.ejs', { invalidCredentials: true });
        }
    });
});
