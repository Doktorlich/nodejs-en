const fs = require("fs");
const path = require("path");

const pt = path.join(path.dirname(require.main.filename), "data", "cart.json");
module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(pt, (err, data) => {
            try {
                let cart = { products: [], totalPrice: 0 };
                if (!err && data.length > 0) {
                    cart = JSON.parse(data);
                }
                const existingProductIndex = cart.products.findIndex(product => product.id === id);
                const existingProduct = cart.products[existingProductIndex];
                let updatedProduct;
                if (existingProduct) {
                    updatedProduct = { ...existingProduct };
                    updatedProduct.qty = updatedProduct.qty + 1;
                    cart.products = [...cart.products];
                    cart.products[existingProductIndex] = updatedProduct;
                } else {
                    updatedProduct = { id: id, qty: 1 };
                    cart.products = [...cart.products, updatedProduct];
                }
                cart.totalPrice = cart.totalPrice + +productPrice;
                fs.writeFile(pt, JSON.stringify(cart, null, 2), err => {
                    console.log(err);
                });
            } catch (error) {
                console.error("Error:", error);
            }
        });
    }
    static deleteProduct(id, productPrice) {
        fs.readFile(pt, (err, data) => {
            try {
                if (err) {
                    return;
                }
                const updatedCart = { ...JSON.parse(data) };
                const product = updatedCart.products.find(product => product.id === id);
                if (!product) {
                    return;
                }
                const productQty = product.qty;
                updatedCart.products = updatedCart.products.filter(product => product.id !== id);
                updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;
                fs.writeFile(pt, JSON.stringify(updatedCart, null, 2), err => {
                    console.log(err);
                });
            } catch (error) {
                console.error("Error static method deleteProduct", error);
            }
        });
    }

    static getCart(cb) {
        fs.readFile(pt, (err, data) => {
            const cart = JSON.parse(data);
            // || cart.length > 0
            if (err) {
                cb(null);
            } else {
                cb(cart);
            }
        });
    }
};
