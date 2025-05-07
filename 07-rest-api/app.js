express = require("express");
const app = express();
const feedRoutes = require("./routes/feed");

app.use(express.json());
// app.use(express.urlencoded({extended:true}))
app.use("/feed", feedRoutes);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.listen(8000, error => {
    if (error) {
        console.log("Server is not connected");
    } else {
        console.log("Server connected");
    }
});
