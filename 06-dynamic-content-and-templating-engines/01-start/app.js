require("dotenv").config();

const path = require("path");
const express = require("express");
const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const { getStatusError404 } = require("./controllers/error");
const sequelize = require("./util/database");

//association
const Product = require("./model/product");
const User = require("./model/user");
const Cart = require("./model/cart");
const CartItem = require("./model/cart-item");
const Order = require("./model/order");
const OrderItem = require("./model/order-item");

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    User.findByPk(1)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(error => {
            console.error(error);
        });
});

app.set("view engine", "pug");
app.set("views", "views");

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(getStatusError404);
sequelize
    // { alter: true }
    .sync()
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if (!user) {
            return User.create({
                name: "Alice",
                email: "alice@mail.com",
                address: "Russia",
            });
        }
        return Promise.resolve(user);
    })
    .then(user => {
        return user.createCart();
    })
    .then(user => {
        app.listen(3000);
    })
    .catch(error => {
        console.error(error);
    });
