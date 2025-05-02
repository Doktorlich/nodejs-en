// подключение бибилиотеки env  в кглавном файле , для покрытие всей системы
require("dotenv").config();
// импорт библиотек
const path = require("path");
const express = require("express");
const app = express();
// инициализация пакета csrf
const csrf = require("csurf");

// парсер для файлов
const multer = require("multer");

// импорт роутов
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
// импорт страницы с выводом ошибки в случае не верного роута
const errorControllers = require("./controllers/error");

// подключении mongoose
const mongoose = require("mongoose");
const User = require("./model/user");

// функции для преобразования полученных данных в читаемый пользователем формат(bodyparser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const upload = multer({ storage });
// app.use("admin/add-product", upload.single("image"), (req, res) => {
//     console.log(req.file);
//     console.log("Файл загружен");
// });

// настройка хранилища файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
// фильтрация файлов при загрузке
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
        console.log("The file has been uploaded");
    } else {
        console.log("File upload failed: Incorrect format");
        cb(null, false);
    }
};
// запуск парсера
app.use(multer({ storage, fileFilter }).single("image"));

// добавлений публичных путей для подключения сторонних файлов: CSS/JS
app.use(express.static(path.join(__dirname, "public")));
// добавлений публичных путей для подключения сторонних файлов: images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
});
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use((error, req, res, next) => {
    console.error("❌ SERVER ERROR:", error);

    res.status(error.httpStatusCode || 500).render("500", {
        docTitle: "Error!",
        path: "/500",
        isAuthenticated: req.session ? req.session.isLoggedIn : false,
    });
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

// app.get("/500", errorControllers.getStatusError500);
app.use(errorControllers.getStatusError404);
// глобальный обработчик ошибок
