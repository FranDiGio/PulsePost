import express from "express";
import bodyParser from "body-parser";
import validator from "validator";
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
    res.render("ejs/index.ejs");
});

app.get("/about/", (req, res) => {
    res.render("ejs/about.ejs");
});

app.get("/contact/", (req, res) => {
    res.render("ejs/contact.ejs");
});

app.get("/signup/", (req, res) => {
    res.sendFile(__dirname + "/views/html/sign-up.html");
});

app.get("/login/", (req, res) => {
    res.sendFile(__dirname + "/views/html/log-in.html");
});

app.post('/api/signup', (req, res) => {
    const { nickname, email, password } = req.body;
    const newUser = new User(nickname, email, password);
    users.push(newUser);
    console.log(newUser.toString());
    res.send('<h3>Sign-up successful</h3>');
});

app.post('/api/login', (req, res) => {
    res.send(`Login attempted with email: ${req.body["email"]} and password: ${req.body["password"]}`);
});
