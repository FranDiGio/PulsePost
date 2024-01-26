import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express();
const port = 3000;

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

