const Product = require("../model/product");
const Order = require("../model/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const ITEMS_PER_PAGE = 1;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// страница со всеми товарами
function getProducts(req, res, next) {
    console.log(process.env.STRIPE_SECRET_KEY);
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render("shop/product-list", {
                cbProducts: products,
                docTitle: "All products",
                path: "/products",
                totalProducts: totalItems,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: +page + +1,
                previousPage: +page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
// базовая страница
function getIndex(req, res, next) {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render("shop/index", {
                cbProducts: products,
                docTitle: "Shop",
                path: "/",
                totalProducts: totalItems,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: +page + +1,
                previousPage: +page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

function getCheckout(req, res, next) {
    let products;
    let total = 0;
    req.user
        .populate("cart.items.productId")
        .then(user => {
            products = user.cart.items;
            total = 0;
            products.forEach(product => {
                total += product.quantity * product.productId.price;
            });
            return stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: products.map(product => {
                    return {
                        price_data: {
                            currency: "usd",
                            product_data: {
                                name: product.productId.title,
                                description: product.productId.description,
                            },
                            unit_amount: product.productId.price * 100,
                        },
                        quantity: product.quantity,
                    };
                }),
                success_url: req.protocol + "://" + req.get("host") + "/checkout/success", // => http://localhost:3000
                cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
            });
        })
        .then(session => {
            res.render("shop/checkout", {
                docTitle: "Checkout",
                path: "/checkout",
                products: products,
                totalSum: total.toFixed(2),
                sessionId: session.id,
                PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
function getCheckoutSuccess(req, res, next) {
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

function getOrders(req, res, next) {
    Order.find({ "user.userId": req.user._id })
        .then(orders => {
            console.log(orders);
            res.render("shop/orders", {
                docTitle: "Your Orders",
                path: "/orders",
                orders: orders,
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}

function getInvoice(req, res, next) {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error("No order found"));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error("Unauthorized"));
            }
            const invoiceName = "invoice-" + orderId + ".pdf";
            const invoicePath = path.join("data", "invoices", invoiceName);
            const pdfDoc = new PDFDocument();
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.text("Hello World");
            pdfDoc.fontSize(26).text("Invoice", {
                underline: true,
            });
            pdfDoc.text("-----------------------");
            let totalPrice = 0;
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title + " - " + prod.quantity + " * " + "$" + prod.product.price);
            });
            pdfDoc.text("------");
            pdfDoc.text(`Total price: $${totalPrice} `);
            pdfDoc.end();
            // fs.readFile(invoicePath, (err, data) => {
            //     if (err) {
            //         return next(err);
            //     }
            //     res.setHeader("Content-Type", "application/pdf");
            //     res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);
            //     // res.setHeader("Content-Disposition", `attachment; filename="${invoiceName}"`);
            //     res.send(data);
            // });
            // const file = fs.createReadStream(invoicePath);
            //
            // file.pipe(res);
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
    getInvoice,
    getCheckoutSuccess,
};
