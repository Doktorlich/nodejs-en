require("dotenv").config();
const express = require("express");
const app = express();

const { Server } = require("socket.io");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const mongoose = require("mongoose");

const path = require("node:path");

const multer = require("multer");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

app.use(express.json());
// app.use(express.urlencoded({extended:true}))

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
// лучше писать    middleware до роутов, который влияет на весь трафик
// — его действительно нужно размещать до маршрутов.

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        const server = app.listen(8080); // запускаем сервер после подключения и создания пользователя
        const io = require("./socket").init(server);
        io.on("connection", socket => {
            console.log("Client connected");
        });
        console.log("Connected to MongoDB");
    })
    .catch(error => {
        console.error(error);
    });
