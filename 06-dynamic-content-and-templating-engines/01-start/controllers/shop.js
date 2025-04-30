const Product = require("../model/product");
const Order = require("../model/order");

// страница со всеми товарами
function getProducts(req, res, next) {
    Product.find()
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
// индивидуальная карточка продукта
function getProduct(req, res, next) {
    const prodId = req.params.productId;

    Product.findById(prodId)
        .then(product => {
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
// базовая страница
function getIndex(req, res, next) {
    Product.find()
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
// перенаправление товаров из корзины в папку заказов
function postOrder(req, res, next) {
    req.user
        .populate("cart.items.productId")
        .then(user => {
            const products = user.cart.items.map(i => {
                return { quantity: i.quantity, product: { ...i.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user,
                },
                products: products,
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect("/orders");
        })
        .catch(error => {
            console.error(error);
        });
}

function getOrders(req, res, next) {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
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
    res.render("shop/checkout", { docTitle: "Checkout", path: "/checkout", isAuthenticated: req.session.isLoggedIn });
}
// отображение товаров в корзине
function getCart(req, res, next) {
    req.user
        .populate("cart.items.productId")
        .then(user => {
            const products = user.cart.items;
            res.render("shop/cart", {
                docTitle: "Your Cart",
                path: "/cart",
                products: products,
            });
        })
        .catch(error => {
            console.error(error);
        });
}
// отправка запроса на добавление товаров в корзину
function postCart(req, res, next) {
    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect("/cart");
        })
        .catch(error => {
            console.error(error);
        });
}
// удаление товара из корзины
function postCartDeleteProduct(req, res, next) {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
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
