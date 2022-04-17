const express = require("express");
const morgan = require("morgan");
const path = require("path");
const api = require("./api");
const TemplateEngine = require("./TemplateEngine");

const app = express();

const PORT = 3000;
const HOSTNAME = "localhost";

// Setup Morgan for Express logging
app.use(morgan("tiny"));

// Set static routes
app.use("/css", express.static(path.join(__dirname, "views", "css")));
app.use("/js", express.static(path.join(__dirname, "views", "js")));
app.use("/icons", express.static(path.join(__dirname, "..", "node_modules", "bootstrap-icons", "font")));

// Set view-related options
app.set("views", path.join(__dirname, "views"));

// Setup API
app.use("/api", api);

// Setup the Template Engine
let engine = new TemplateEngine(app);
engine.addCss("main.css");  // This CSS will apply to ALL pages
engine.addJs("main.js");    // This JS will be included on ALL pages

// Homepage
app.get("/", (req, res) => {
    res.render("home", {
        title: "Home",
    });
});

// Match all other page routes (404)
app.get("*", (req, res) => {
    res.render("404", {
        title: "Not Found"
    });
});

// Listen
app.listen(PORT, HOSTNAME, () => {
    console.log(`Server running on ${HOSTNAME}:${PORT}`);
});