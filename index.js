import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import dotenv from 'dotenv';
import { isStrongPassword } from "./services/userService.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { User } from './models/User.mjs';
import { getDatabase, ref, set } from "firebase/database";

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
const database = getDatabase(firebaseApp);

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
let users = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: '9qB7n!4@F#5ZwpUJ*3Hg',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto' }
}));

app.listen(port, () => {
    console.log("Listening to port " + port);
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/feed/", (req, res) => {
    res.render("feed.ejs", { nickname: req.session.nickname });
});

app.get("/about/", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact/", (req, res) => {
    res.render("contact.ejs");
});

app.get("/signup/", (req, res) => {
    res.render("sign-up.ejs", { success: false });
});

app.get("/login/", (req, res) => {
    res.render("log-in.ejs");
});

app.post('/api/signup', (req, res) => {
    const { nickname, email, password } = req.body;

    if (users.some(user => user.nickname === nickname)) {
        res.render("sign-up.ejs", { success: false, invalidNickname: true });
    } 
    else if (users.some(user => user.email === email)) {
        res.render("sign-up.ejs", { success: false, invalidEmail: true });
    } 
    else if (!isStrongPassword(password)) {
        res.render("sign-up.ejs", { success: false, invalidPassword: true });
    } 
    else {
        const newUser = new User(nickname, email, password);
        users.push(newUser);
        req.session.nickname = newUser.nickname;
        
        set(ref(database, 'users/' + newUser.nickname), {
            nickname: newUser.nickname,
            email: newUser.email
        });
        
        res.render("sign-up.ejs", { success: true });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const userExists = users.some(user => user.email === email && user.password === password);

    if (userExists) {
        res.redirect("/feed/");
    } else {
        res.render("log-in.ejs", { invalid: true });
    }
});
