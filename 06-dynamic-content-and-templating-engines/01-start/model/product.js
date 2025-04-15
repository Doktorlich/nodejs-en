const fs = require("fs");
const path = require("path");

const getProductFromFile = cb => {
    const pt = path.join(path.dirname(require.main.filename), "data", "products.json");
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
    constructor(title) {
        this.title = title;
    }

    save() {
        const pt = path.join(path.dirname(require.main.filename), "data", "products.json");

        fs.readFile(pt, (err, data) => {
            let productsData = [];
            if (!err && data.length > 0) {
                try {
                    productsData = JSON.parse(data);
                } catch (error) {
                    console.log("Error", error);
                }
            }
            productsData.push(this);
            fs.writeFile(pt, JSON.stringify(productsData, null, 2), err => {
                if (err) {
                    console.error(err);
                }
            });
        });
    }

    static fetchAll(cb) {
        getProductFromFile(cb);
    }
};
