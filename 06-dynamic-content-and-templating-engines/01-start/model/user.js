const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");
class User {
    constructor(username, email, cart, id) {
        this.username = username;
        this.email = email;
        this.cart = cart;
        this._id = id;
    }
    save() {
        const db = getDb();
        return db
            .collection("users")
            .insertOne(this)
            .then(result => {
                return result;
            })
            .catch(error => {
                console.error(error);
            });
    }
    addToCart(product) {
        const cartProductIndex = this.cart.items.findIndex(cartProduct => {
            return cartProduct.productId.toString() === product._id.toString();
        });
        const updatedCartItems = [...this.cart.items];
        let newQuantity = 1;
        if (cartProductIndex >= 0) {
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productId: new ObjectId(product._id), quantity: newQuantity });
        }

        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        return db
            .collection("users")
            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: updatedCart } })
            .then(result => {
                console.log("result", result);
                return result;
            })
            .catch(error => {
                console.error(error);
            });
    }
    getCart() {
        const db = getDb();
        const productsIds = this.cart.items.map(ind => {
            return ind.productId;
        });
        return db
            .collection("products")
            .find({ _id: { $in: productsIds } })
            .toArray()
            .then(products => {
                return products.map(product => {
                    return {
                        ...product,
                        quantity: this.cart.items.find((value, index, obj) => {
                            return value.productId.toString() === product._id.toString();
                        }).quantity,
                    };
                });
            })
            .catch(error => {
                console.error(error);
            });
    }

    deleteItemFromCart(productId) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString();
        });
        const db = getDb();
        return db
            .collection("users")
            .updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } })
            .then(items => {
                return items;
            })
            .catch(error => {
                console.error(error);
            });
    }
    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new ObjectId(this._id),
                        username: this.username,
                        email: this.email,
                    },
                };
                return db.collection("orders").insertOne(order);
            })
            .catch(error => {
                console.error(error);
            })
            .then(result => {
                this.cart = { items: [] };
                return db.collection("users").updateOne({ _id: new ObjectId(this._id) }, { $set: { cart: { items: [] } } });
            })
            .catch(error => {
                console.error(error);
            });
    }
    getOrder() {
        const db = getDb();
        return db
            .collection("orders")
            .findOne()
            .find({ "user._id": new ObjectId(this._id) })
            .toArray()
            .then(() => {})
            .catch(error => {
                console.error(error);
            });
    }
    static findById(id) {
        const db = getDb();
        return db
            .collection("users")
            .findOne({ _id: new ObjectId(id) })
            .then(user => {
                return user;
            })
            .catch(error => {
                console.error(error);
            });
    }
}

module.exports = User;
