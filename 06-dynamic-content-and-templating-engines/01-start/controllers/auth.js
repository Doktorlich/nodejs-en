const User = require("../model/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Убираем создание транспортер здесь!
// Будем создавать внутри функции
let transporter;

async function createTransporter() {
    const testAccount = await nodemailer.createTestAccount(); // Ждем создания тестового аккаунта
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
    });
}

function postLogin(req, res, next) {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    User.findOne({ email: emailBody })
        .then(user => {
            if (!user) {
                return res.redirect("/login");
            }
            const hashedPassword = user.password;
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
                .catch(console.error);
        })
        .catch(console.error);
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
    });
}

async function postSignup(req, res, next) {
    const emailBody = req.body.email;
    const passwordBody = req.body.password;
    const confirmPasswordBody = req.body.confirmPassword;
    try {
        const userDoc = await User.findOne({ email: emailBody });
        if (userDoc) {
            return res.redirect("/signup");
        }

        const hashedPassword = await bcrypt.hash(passwordBody, 12);
        const user = new User({
            email: emailBody,
            password: hashedPassword,
            cart: { items: [] },
        });

        await user.save();

        if (!transporter) {
            transporter = await createTransporter(); // создаем только один раз
        }

        const info = await transporter.sendMail({
            from: '"Test Sender" <test@example.com>',
            to: emailBody,
            subject: "Signup succeeded",
            text: "Hello! This email was sent via Brevo SMTP.",
            html: "<h1>Hello!</h1><p>This email was sent via <b>Brevo SMTP.</b></p>",
        });

        console.log("Письмо успешно отправлено:", nodemailer.getTestMessageUrl(info)); // важно: здесь будет ссылка на просмотр письма
        res.redirect("/");
    } catch (error) {
        console.error("Ошибка в postSignup", error);
    }
}

function getReset(req, res, next) {
    res.render("auth/reset", {
        docTitle: "Reset password",
        path: "/reset",
    });
}

module.exports = { getLogin, postLogin, postLogout, getSignup, postSignup, getReset };
