// const path = require("path");
// const rootDir = require("../util/path");
const express = require("express");

const adminData = require("./admin");

const router = express.Router();

router.get("/", (req, res, next) => {
    // console.log(adminData.products);
    // res.sendFile(path.join(rootDir, "views", "shop.html"));
    const productsData = adminData.products;
    res.render("shop.ejs", { products: productsData, docTitle: "Shop", path: "/" });
});

module.exports = router;
