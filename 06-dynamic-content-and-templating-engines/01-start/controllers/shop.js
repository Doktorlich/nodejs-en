const Product = require("../model/product");

function getProducts(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("shop/product-list", {
            cbProducts,
            docTitle: "All products",
            path: "/products",
        });
    });
}

function getIndex(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("shop/index", { cbProducts, docTitle: "Shop", path: "/" });
    });
}

function getCart(req, res, next) {
    res.render("shop/cart", { docTitle: "Your Cart", path: "/cart" });
}
function getOrders(req, res, next) {
    res.render("shop/orders", { docTitle: "Your Orders", path: "/orders" });
}

function getCheckout(req, res, next) {
    res.render("shop/checkout", { docTitle: "Checkout", path: "/checkout" });
}

module.exports = { getProducts, getIndex, getCart, getCheckout, getOrders };

// products
// cart
// checkout
