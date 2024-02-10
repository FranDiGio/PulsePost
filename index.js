import express from "express";
import bodyParser from "body-parser";
import { isStrongPassword } from "./services/userService.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { User } from './models/User.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express();
const port = 3000;
let users = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(port, () => {
    console.log("Listening to port " + port)
});

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get("/about/", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact/", (req, res) => {
    res.render("contact.ejs");
});

app.get("/signup/", (req, res) => {
    res.render("sign-up.ejs", { success: false, invalidPassword: false });
});

app.get("/login/", (req, res) => {
    res.render("log-in.ejs");
});

app.post('/api/signup', (req, res) => {
    const { nickname, email, password } = req.body;
    
    if (isStrongPassword(password)){
        const newUser = new User(nickname, email, password);
        users.push(newUser);
        res.render("sign-up.ejs", { success: true });
    } 
    else {
        res.render("sign-up.ejs", { success: false, invalidPassword: true });
    }
    
});

app.post('/api/login', (req, res) => {
    res.send(`Login attempted with email: ${req.body["email"]} and password: ${req.body["password"]}`);
});
