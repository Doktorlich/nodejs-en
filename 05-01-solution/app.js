const express = require("express");
const defaultRouters = require("./routes/default");
const usersRouters = require("./routes/users");
const path = require("node:path");
const app = express();
const pathName = require("./util/path");

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(pathName, "public")));

app.use(defaultRouters);
app.use(usersRouters);

app.listen(3000);
