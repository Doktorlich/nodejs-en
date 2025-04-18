const Product = require("../model/product");
const Cart = require("../model/cart");

function getProducts(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("shop/product-list", {
            cbProducts,
            docTitle: "All products",
            path: "/products",
        });
    });
}

function getProduct(req, res, next) {
    const prodId = req.params.productsId;
    Product.findById(prodId, product => {
        try {
            res.render("shop/product-details", {
                docTitle: product.title,
                product: product,
                path: "/products",
            });
        } catch (error) {
            console.log("product:", product);
            console.error("Error:", error);
        }
    });
}

function getIndex(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("shop/index", { cbProducts, docTitle: "Shop", path: "/" });
    });
}

function getCart(req, res, next) {
    try {
        Cart.getCart(cart => {
            Product.fetchAll(products => {
                const cartProducts = [];
                for (const product of products) {
                    const cartProductData = cart.products.find(prod => prod.id === product.id);
                    if (cartProductData) {
                        cartProducts.push({ productData: product, qty: cartProductData.qty });
                    }
                }
                res.render("shop/cart", { docTitle: "Your Cart", path: "/cart", products: cartProducts });
            });
        });
    } catch (error) {
        console.error("Error", error);
    }
}
function getOrders(req, res, next) {
    res.render("shop/orders", { docTitle: "Your Orders", path: "/orders" });
}

function getCheckout(req, res, next) {
    res.render("shop/checkout", { docTitle: "Checkout", path: "/checkout" });
}

function postCart(req, res, next) {
    const productId = req.body.productId;

    try {
        res.redirect("/cart");
        Product.findById(productId, product => {
            console.log("productId", productId);
            console.log("product.price", product.price);
            try {
                Cart.addProduct(productId, product.price);
            } catch (error) {
                console.error("Error", error);
            }
        });
    } catch (error) {
        console.error("Error:", error);
    }
}
function postCartDeleteProduct(req, res, next) {
    try {
        const prodId = req.body.productId;
        Product.findById(prodId, product => {
            Cart.deleteProduct(prodId, product.price);
            res.redirect("/cart");
        });
    } catch (error) {
        console.error("Error", error);
    }
}

module.exports = { getProducts, getIndex, getCart, getCheckout, getOrders, getProduct, postCart, postCartDeleteProduct };

// products
// cart
// checkout
