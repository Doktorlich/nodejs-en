// const path = require("path");
// const rootDir = require("../util/path");
const express = require("express");
const { getDisplayProducts } = require("../controllers/products");

const router = express.Router();

router.get("/", getDisplayProducts);

module.exports = router;
