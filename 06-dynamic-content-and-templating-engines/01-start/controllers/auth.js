const User = require("../model/user");
function getLogin(req, res, next) {
    // const isLoggedIn = req.get("Cookie").trim().split("=")[1] === "true";
    // console.log(isLoggedIn);
    console.log(req.session.isLoggedIn);
    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
        isAuthenticated: false,
    });
}
// отправлем запрос на сохранение пользователя в сессионном хранилище
function postLogin(req, res, next) {
    User.findById("6809d79a73b7f0bf8253c93a")
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            req.session.save(err => {
                console.log(err);
                res.redirect("/");
            });
        })
        .catch(error => {
            console.error(error);
        });
}
function postLogout(req, res, next) {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
}

module.exports = { getLogin, postLogin, postLogout };
