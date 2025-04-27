// подключение бибилиотеки env  в кглавном файле , для покрытие всей системы
require("dotenv").config();
// импорт библиотек
const path = require("path");
const express = require("express");
const app = express();
// инициализация пакета csrf
const csrf = require("csurf");

// импорт роутов
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
// импорт страницы с выводом ошибки в случае не верного роута
const { getStatusError404 } = require("./controllers/error");

// подключении mongoose
const mongoose = require("mongoose");
const User = require("./model/user");

// функции для преобразования полученных данных в читаемый пользователем формат
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// добавлений публичных путей для подключения сторонних файлов: CSS/JS
app.use(express.static(path.join(__dirname, "public")));

// подключение сессионного хранилища
const session = require("express-session");
const MongoDBGStore = require("connect-mongodb-session")(session);

//подключение и настройка сессионного хранилища через mongodb
const store = new MongoDBGStore({ uri: process.env.MONGODB_URI, collection: "sessions" });
app.use(session({ secret: "my secret", resave: false, saveUninitialized: false, store: store }));

// работа с csrf
const csrfProtection = csrf();
app.use(csrfProtection);

//подключения движка для обработки pug
app.set("view engine", "pug");
app.set("views", "views");

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(error => {
            console.error(error);
        });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(3000); // запускаем сервер после подключения и создания пользователя
        console.log("Connected to MongoDB");
    })
    .catch(error => {
        console.error(error);
    });

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(getStatusError404);
