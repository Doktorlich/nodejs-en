const fs = require("fs");
const path = require("path");
const pt = path.join(path.dirname(require.main.filename), "data", "products.json");

const Cart = require("./cart");

const getProductFromFile = cb => {
    fs.readFile(pt, (err, data) => {
        if (err || data.length === 0) {
            return cb([]);
        }
        try {
            cb(JSON.parse(data));
        } catch (error) {
            cb([]);
            console.log("Error", error);
        }
    });
};

module.exports = class Product {
    constructor(id, title, imageUrl, price, description) {
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save() {
        fs.readFile(pt, (err, data) => {
            let productsData = [];
            if (!err && data.length > 0) {
                try {
                    productsData = JSON.parse(data);
                } catch (error) {
                    console.log("Error", error);
                }
            }
            if (this.id) {
                const existingProductIndex = productsData.findIndex(product => product.id === this.id);
                const updateProducts = [...productsData];
                updateProducts[existingProductIndex] = this;
                fs.writeFile(pt, JSON.stringify(updateProducts, null, 2), err => {
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                this.id = Math.random().toString();
                productsData.push(this);
                fs.writeFile(pt, JSON.stringify(productsData, null, 2), err => {
                    if (err) {
                        console.error(err);
                    }
                });
            }
        });
    }

    static deleteById(id) {
        getProductFromFile(products => {
            const product = products.find(product => product.id === id);
            const updateProducts = products.filter(product => product.id !== id);
            fs.writeFile(pt, JSON.stringify(updateProducts, null, 2), err => {
                if (!err) {
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
    }

    static fetchAll(cb) {
        getProductFromFile(cb);
    }

    static findById(id, cb) {
        getProductFromFile(products => {
            const product = products.find(product => product.id === id);
            cb(product);
        });
    }
};
