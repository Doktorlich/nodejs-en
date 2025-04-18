const path = require("path");
const express = require("express");
const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const { getStatusError404 } = require("./controllers/error");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// app.set("views", "views");

app.set("view engine", "pug");
app.set("views", "views");

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(getStatusError404);

app.listen(3000);
