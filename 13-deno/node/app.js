const express = require("express");
const app = express();
const todoRoutes = require("./routes/todos");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log();
    next();
});

app.use(todoRoutes);

app.listen(3000, error => {
    if (error) {
        console.log("Not connect");
    }
    console.log("connect");
});
