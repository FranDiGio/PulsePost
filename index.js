import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express();
const port = 3000;

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

app.post('/api/signup', (req, res) => {
    res.send(`Sign-up done with name: ${req.body["name"]}, email: ${req.body["email"]} and password: ${req.body["password"]}`);
});

app.get("/login/", (req, res) => {
    res.sendFile(__dirname + "/views/html/log-in.html");
});

app.post('/api/login', (req, res) => {
    res.send(`Login attempted with email: ${req.body["email"]} and password: ${req.body["password"]}`);
});
