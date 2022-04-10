const express = require("express");
const https = require("https");
const url = require("url");
const router = express.Router();

require('dotenv').config();

const API_KEY = process.env.API_KEY;

// Simple middleware to set headers on all responses
function apiMiddleware(req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
}

router.get("/weather/:q", apiMiddleware, (req, res) => {
    req.query.q = req.params.q; // Take the q parameter from the URL and set it as a query parameter
    request('weather', req.query, (err, response) => {  // Make call to OpenWeatherMap
        if (err) {
            console.error(err);
            res.status(500); // Internal Server Error status code
            res.json({ status: 500 });
        } else {
            res.status(response.status);
            res.json(response);
        }
    });
});


router.get("*", apiMiddleware, (req, res) => {
    res.status(404); // Page not found status code
    res.json({ status: 404 });
});

/**
 * Makes a request to OpenWeatherMap's API
 * @param path API path
 * @param params API parameters
 * @param callback
 */
function request(path, params, callback) {
    // Setup URL parameters
    path += `?appid=${API_KEY}`;
    for (const key in params) path += `&${key}=${params[key]}`;

    console.log(path)

    const options = {
        host: 'api.openweathermap.org', port: 443, method: 'GET', path: `/data/2.5/${path}`,
    };

    const response = {};
    const request = https.request(options, res => {
        response.status = res.statusCode;
        let data = "";

        res.on('data', d => {
            data += d; // Each time we get data, add it
        });

        res.on('end', function () {
            response.data = JSON.parse(data); // Parse data into JSON
            callback(null, response)
        });
    });

    request.on("error", error => callback(error));
    request.end();
}

module.exports = router;