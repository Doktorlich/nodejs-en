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

const mongoConnect = require("./util/database").mongoConnect;

// функции для преобразования полученных данных в читаемый пользователем формат
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// добавлений публичных путей для подключения сторонних файлов: CSS/JS
app.use(express.static(path.join(__dirname, "public")));

// ипорт модели пользователей
const User = require("./model/user");
//поиск пользователя по конкретному id
app.use((req, res, next) => {
    User.findById("6808b5a67fd380fc2af5e9d4")
        .then(user => {
            req.user = new User(user.username, user.email, user.cart, user._id);
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

mongoConnect(() => {
    app.listen(3000);
});
