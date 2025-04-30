const User = require("../model/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

let transporter;

async function createTransporter() {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

function getLogin(req, res, next) {
    res.render("auth/login", {
        docTitle: "Login",
        path: "/login",
        errorMessage: null,
        oldInput: { email: "", password: "" },
        validationErrors: [],
        csrfToken: req.csrfToken(),
    });
}

function postLogin(req, res, next) {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/login", {
            docTitle: "Login",
            path: "/login",
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            oldInput: { email: emailBody, password: passwordBody },
            csrfToken: req.csrfToken(),
        });
    }

    User.findOne({ email: emailBody })
        .then(user => {
            if (!user) {
                return res.status(422).render("auth/login", {
                    docTitle: "Login",
                    path: "/login",
                    errorMessage: "Invalid email or password.",
                    validationErrors: [],
                    oldInput: { email: emailBody, password: passwordBody },
                    csrfToken: req.csrfToken(),
                });
            }
            return bcrypt.compare(passwordBody, user.password).then(doMatch => {
                if (!doMatch) {
                    return res.status(422).render("auth/login", {
                        docTitle: "Login",
                        path: "/login",
                        errorMessage: "Invalid email or password.",
                        validationErrors: [],
                        oldInput: { email: emailBody, password: passwordBody },
                        csrfToken: req.csrfToken(),
                    });
                }
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect("/");
                });
            });
        })
        .catch(err => {
            console.error("Ошибка в postLogin:", err);
            res.redirect("/login");
        });
}

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
        errorMessage: null,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationErrors: [],
        csrfToken: req.csrfToken(),
    });
}

async function postSignup(req, res, next) {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    const confirmPasswordBody = req.body.confirmPassword;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("auth/signup", {
            docTitle: "Signup",
            path: "/signup",
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            oldInput: {
                email: emailBody,
                password: passwordBody,
                confirmPassword: confirmPasswordBody,
            },
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(passwordBody, 12);
        const user = new User({
            email: emailBody,
            password: hashedPassword,
            cart: { items: [] },
        });

        await user.save();

        if (!transporter) {
            transporter = await createTransporter();
        }

        const info = await transporter.sendMail({
            from: '"Test Sender" <test@example.com>',
            to: emailBody,
            subject: "Signup succeeded",
            text: "Hello! This email was sent via Brevo SMTP.",
            html: "<h1>Hello!</h1><p>This email was sent via <b>Brevo SMTP.</b></p>",
        });

        console.log("Письмо успешно отправлено:", nodemailer.getTestMessageUrl(info));
        res.redirect("/login");
    } catch (error) {
        console.error("Ошибка в postSignup:", error);
        res.redirect("/signup");
    }
}

function getReset(req, res, next) {
    res.render("auth/reset", {
        docTitle: "Reset password",
        path: "/reset",
        csrfToken: req.csrfToken(),
    });
}

function postReset(req, res, next) {
    crypto.randomBytes(32, async (err, buf) => {
        if (err) {
            console.error(err);
            return res.redirect("/reset");
        }

        const token = buf.toString("hex");

        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.redirect("/reset");
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000; // 1 час
            await user.save();

            if (!transporter) {
                transporter = await createTransporter();
            }

            const info = await transporter.sendMail({
                from: '"Test Sender" <test@example.com>',
                to: req.body.email,
                subject: "Password reset",
                html: `
                    <p>You requested a password reset</p>
                    <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
                `,
            });

            console.log("Ссылка на письмо:", nodemailer.getTestMessageUrl(info));
            res.redirect("/");
        } catch (error) {
            console.error("Ошибка в postReset:", error);
            res.redirect("/reset");
        }
    });
}

function getNewPassword(req, res, next) {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then(user => {
            if (!user) {
                return res.redirect("/reset");
            }
            res.render("auth/new-password", {
                docTitle: "New password",
                path: "/new-password",
                userId: user._id.toString(),
                passwordToken: token,
                csrfToken: req.csrfToken(),
            });
        })
        .catch(err => {
            console.error(err);
            res.redirect("/reset");
        });
}

function postNewPassword(req, res, next) {
    const newPass = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then(user => {
            if (!user) {
                return res.redirect("/reset");
            }
            resetUser = user;
            return bcrypt.hash(newPass, 12);
        })
        .then(hashedPass => {
            resetUser.password = hashedPass;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => {
            res.redirect("/login");
        })
        .catch(err => {
            console.error("Ошибка в postNewPassword:", err);
            res.redirect("/reset");
        });
}

module.exports = {
    getLogin,
    postLogin,
    postLogout,
    getSignup,
    postSignup,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword,
};
