const Product = require("../model/product");
const Cart = require("../model/cart");
const Order = require("../model/order");

function getProducts(req, res, next) {
    Product.findAll()
        .then(products => {
            res.render("shop/product-list", {
                cbProducts: products,
                docTitle: "All products",
                path: "/products",
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function getProduct(req, res, next) {
    const prodId = req.params.productsId;
    Product.findAll({ where: { id: prodId } })
        .then(([product]) => {
            res.render("shop/product-details", {
                docTitle: product.title,
                product: product,
                path: "/products",
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function getIndex(req, res, next) {
    Product.findAll()
        .then(products => {
            res.render("shop/index", {
                cbProducts: products,
                docTitle: "Shop",
                path: "/",
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function postOrder(req, res, next) {
    let fetchedCart;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user
                .createOrder()
                .then(order => {
                    return order.addProducts(
                        products.map(product => {
                            product.orderItem = { quantity: product.cartItem.quantity };
                            return product;
                        }),
                    );
                })
                .catch(error => {
                    console.error(error);
                });
        })
        .then(order => {
            return fetchedCart.setProducts(null);
        })
        .then(result => {
            res.redirect("/orders");
        })
        .catch(error => {
            console.error(error);
        });
}

function getOrders(req, res, next) {
    req.user
        .getOrders({ include: ["products"] })
        .then(orders => {
            console.log(
                "--------------------------------------------------------------------------------------",
            );
            console.log(
                "--------------------------------------------------------------------------------------",
            );
            console.log(
                "--------------------------------------------------------------------------------------",
            );

            console.log("orders[0].products[0]", orders[0].products);
            res.render("shop/orders", {
                docTitle: "Your Orders",
                path: "/orders",
                orders: orders,
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function getCheckout(req, res, next) {
    res.render("shop/checkout", { docTitle: "Checkout", path: "/checkout" });
}

function getCart(req, res, next) {
    req.user
        .getCart()
        .then(cart => {
            return cart
                .getProducts()
                .then(products => {
                    res.render("shop/cart", {
                        docTitle: "Your Cart",
                        path: "/cart",
                        products: products,
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        })
        .catch(error => {
            console.error(error);
        });
}

function postCart(req, res, next) {
    const productId = req.body.productId;
    let fetchedCart;
    let newQty = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({ where: { id: productId } });
        })
        .then(products => {
            // console.log(products);
            let product;
            if (products.length > 0) {
                product = products[0];
            }
            if (product) {
                const oldQty = product.cartItem.quantity;
                newQty = oldQty + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then(product => {
            return fetchedCart.addProduct(product, { through: { quantity: newQty } });
        })
        .then(() => {
            res.redirect("/cart");
        })
        .catch(error => {
            console.error(error);
        });
}

function postCartDeleteProduct(req, res, next) {
    const prodId = req.body.productId;
    req.user
        .getCart()
        .then(cart => {
            return cart.getProducts({ where: { id: prodId } });
        })
        .then(products => {
            const product = products[0];
            product.cartItem.destroy();
        })
        .then(result => {
            res.redirect("/cart");
        })
        .catch(error => {
            console.error(error);
        });
}

module.exports = {
    getProducts,
    getIndex,
    getCart,
    getCheckout,
    getOrders,
    getProduct,
    postCart,
    postCartDeleteProduct,
    postOrder,
};
