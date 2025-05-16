require("dotenv").config();
const express = require("express");
const app = express();
const { clearImage } = require("./util/file");
const mongoose = require("mongoose");

const path = require("node:path");

const multer = require("multer");
const auth = require("./middleware/auth");

const { graphqlHTTP } = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

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
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
// лучше писать    middleware до роутов, который влияет на весь трафик
// — его действительно нужно размещать до маршрутов.

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single("image"));

app.use(auth);

app.put("/post-image", (req, res, next) => {
    if (!req.isAuth) {
        throw new Error("Not authenticated");
    }
    if (!req.file) {
        return res.status(200).json({ message: "No file provided." });
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    return res.status(201).json({ message: "File stored." });
});

app.use(
    "/graphql",
    graphqlHTTP({
        schema: graphqlSchema,
        rootValue: graphqlResolver,
        graphiql: true,
        formatError(error) {
            if (!error.originalError) {
                return error;
            }
            const data = error.originalError.data;
            const message = error.message || "An error occurred.";
            const code = error.originalError.code || 500;
            return {
                message: message,
                status: code,
                data: data,
            };
        },
    }),
);

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
        app.listen(8080); // запускаем сервер после подключения и создания пользователя
        console.log("Connected to MongoDB");
    })
    .catch(error => {
        console.error(error);
    });
