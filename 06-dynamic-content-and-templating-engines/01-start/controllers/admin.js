const Product = require("../model/product");

function getAddProduct(req, res, next) {
    res.render("admin/add-product", { docTitle: "Add Product", path: "/admin/add-product" });
}
function postAddProduct(req, res, next) {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product(title, imageUrl, description, price);
    product.save();
    res.redirect("/");
}

function getProducts(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("admin/products", {
            cbProducts,
            docTitle: "Admin Products",
            path: "admin/products",
        });
    });
}

module.exports = { getAddProduct, postAddProduct, getProducts };
