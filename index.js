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
