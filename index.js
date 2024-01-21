import express from "express";

const app = express();
const port = 3000;

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

app.get("/signup/", (req, res) => {
    res.render("sign-up.ejs");
});

app.get("/login/", (req, res) => {
    res.render("log-in.ejs");
});

