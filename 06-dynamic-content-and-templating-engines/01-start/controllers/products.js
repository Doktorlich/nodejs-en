const Product = require("../model/product");
function getAddProduct(req, res, next) {
    res.render("add-product", { docTitle: "Add Product", path: "/admin/add-product" });
}
function postAddProduct(req, res, next) {
    const product = new Product(req.body.title);

    product.save();
    res.redirect("/");
}
function getDisplayProducts(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("shop.pug", { cbProducts, docTitle: "Shop", path: "/" });
    });
}

module.exports = { getAddProduct, postAddProduct, getDisplayProducts };
