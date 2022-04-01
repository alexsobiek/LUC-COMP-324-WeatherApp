const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 3000;
const HOSTNAME = "localhost";

// Register the "html" view engine
app.engine('html', (path, options, callback) => { // define the template engine
    fs.readFile(path, (err, content) => {
        if (err) return callback(err)
        else return callback(null, content.toString());
    });
});

// Set static routes
app.use("/css", express.static(path.join(__dirname, "views", "css")));
app.use("/js", express.static(path.join(__dirname, "views", "js")));

// Set view-related options
app.set("views", path.join(__dirname, "views"));
app.set("view options", {layout: false});
app.set("view engine", "html");

// Homepage
app.get("/", (req, res) => {
    res.render("index");
});

// Match all other page routes (404)
app.get("*", (req, res) => {
    res.render("404");
})

// Listen
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server running on ${HOSTNAME}:${PORT}`);
});