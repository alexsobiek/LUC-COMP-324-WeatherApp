const express = require("express");
const router = express.Router();

require('dotenv').config();

const API_KEY = process.env.API_KEY;

router.get("*", (req, res) => {
    res.json({
        status: 404
    });
});

module.exports = router;