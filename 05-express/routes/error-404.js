const express = require("express");
const path = require("node:path");

const router = express.Router();
const rootDir = require("../util/path");
router.use((req, res, next) => {
    res.status(404).sendFile(path.join(rootDir, "views", "error-404.html"));
});

module.exports = router;
