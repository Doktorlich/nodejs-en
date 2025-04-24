const mongoose = require("mongoose");
const { Schema, model } = require("mongoose");

const productSchema = new Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = model("Product", productSchema);
// const getDb = require("../util/database").getDb;
// const { ObjectId } = require("mongodb");
//
// class Product {
//     constructor(title, imageUrl, price, description, userId) {
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.price = price;
//         this.description = description;
//         this.userId = userId;
//     }
//     save() {
//         const db = getDb();
//         return db
//             .collection("products")
//             .insertOne(this)
//             .then(result => {
//                 return result;
//             })
//             .catch(error => {
//                 console.error(error);
//             });
//     }
//
//     static fetchAll() {
//         const db = getDb();
//         return db
//             .collection("products")
//             .find()
//             .toArray()
//             .then(products => {
//                 console.log("Fetch products");
//                 return products;
//             })
//             .catch(error => {
//                 console.error(error);
//             });
//     }
//
//     static findById(prodId) {
//         const db = getDb();
//         return db
//             .collection("products")
//             .findOne({ _id: new ObjectId(prodId) })
//             .then(product => {
//                 return product;
//             })
//             .catch(error => {
//                 console.error(error);
//             });
//     }
//     static update(productId, updateData) {
//         const db = getDb();
//         return db
//             .collection("products")
//             .updateOne({ _id: new ObjectId(productId) }, { $set: updateData })
//             .then(() => {})
//             .catch(error => {
//                 console.error(error);
//             });
//     }
//     static delete(productId) {
//         const db = getDb();
//         return db
//             .collection("products")
//             .deleteOne({ _id: new ObjectId(productId) })
//             .then(result => {
//                 return result;
//             })
//             .catch(error => {
//                 console.error(error);
//             });
//     }
// }
//
// module.exports = Product;
