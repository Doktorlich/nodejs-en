// подключение бибилиотеки env  в кглавном файле , для покрытие всей системы
require("dotenv").config();
// импорт библиотек
const path = require("path");
const express = require("express");
const app = express();
// импорт роутов
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
// импорт страницы с выводом ошибки в случае не верного роута
const { getStatusError404 } = require("./controllers/error");

// функции для преобразования полученных данных в читаемый пользователем формат
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// добавлений публичных путей для подключения сторонних файлов: CSS/JS
app.use(express.static(path.join(__dirname, "public")));

const mongoose = require("mongoose");
const User = require("./model/user");

//поиск пользователя по конкретному id
app.use((req, res, next) => {
    User.findById("6809d79a73b7f0bf8253c93a")
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

const uri = `mongodb+srv://doktorlich:${process.env.DB_PASSWORD}@cluster0.fehgica.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
    .connect(uri)
    .then(() => {
        return User.findOne(); // ищем пользователя
    })
    .then(user => {
        if (!user) {
            // если его нет — создаём и сохраняем
            const newUser = new User({
                name: "Alice",
                email: "alice@mail.com",
                cart: { items: [] },
            });
            return newUser.save();
        }
        return user;
    })
    .then(() => {
        app.listen(3000); // запускаем сервер после подключения и создания пользователя
        console.log("Connected to MongoDB");
    })
    .catch(error => {
        console.error(error);
    });
