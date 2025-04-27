const User = require("../model/user");
const bcrypt = require("bcryptjs");
// MONGODB_URI=mongodb+srv://NAME:PASS@cluster0.fehgica.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0;
function getLogin(req, res, next) {
    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
    });
}
// отправлем запрос на сохранение пользователя в сессионном хранилище
function postLogin(req, res, next) {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    User.findOne({ email: emailBody })
        .then(user => {
            const hashedPassword = user.password;
            if (!user) {
                return res.redirect("/login");
            }
            return bcrypt
                .compare(passwordBody, hashedPassword)
                .then(doMatch => {
                    if (!doMatch) {
                        return res.redirect("/login");
                    }
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect("/");
                    });
                })

                .catch(error => {
                    console.error(error);
                });
        })
        .catch(error => {
            console.error(error);
        });
}
// отправляем запрос на выход пользователя из системы
function postLogout(req, res, next) {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    });
}

function getSignup(req, res, next) {
    res.render("auth/signup", {
        docTitle: "Signup",
        path: "/signup",
    });
}
// создание и проверка на отсутсвие дубликатов пользователей
function postSignup(req, res, next) {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    const confirmPasswordBody = req.body.confirmPassword;
    User.findOne({ email: emailBody })
        .then(userDoc => {
            if (userDoc) {
                return res.redirect("/signup");
            }
            return bcrypt
                .hash(passwordBody, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: emailBody,
                        password: hashedPassword,
                        cart: { items: [] },
                    });
                    return user.save();
                })
                .then(() => {
                    res.redirect("/");
                })
                .catch(error => {
                    console.error("Password creation error", error);
                });
        })
        .catch(error => {
            console.error("User creation error", error);
        });
}

module.exports = { getLogin, postLogin, postLogout, getSignup, postSignup };
