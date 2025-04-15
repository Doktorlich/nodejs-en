const express = require("express");
const path = require("node:path");
const router = express.Router();
const dirName = require("../util/path");

router.get("/", (req, res, next) => {
    res.sendFile(path.join(dirName, "views", "main.html"));
});

module.exports = router;
