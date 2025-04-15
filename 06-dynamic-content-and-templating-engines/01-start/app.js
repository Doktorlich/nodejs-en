const path = require("path");

const express = require("express");

const app = express();
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// app.set("view engine", "ejs");
// app.set("views", "./views");

// const { engine } = require("express-handlebars");
// app.engine("hbs", engine({ extname: ".hbs" }));
// app.set("view engine", "hbs");
// app.set("views", "views");

app.set("view engine", "pug");

app.set("views", "views");

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use((req, res, next) => {
    res.status(404).render("404.ejs", { docTitle: "Page Not Found" });

    // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
});

app.listen(3000);
