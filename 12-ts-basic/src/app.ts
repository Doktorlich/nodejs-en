import express, { urlencoded } from "express";
import todos from "./routes/todos";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(todos);
app.listen(3000, error => {
    if (error) {
        console.log(error);
    }
    console.log("Connect");
});
