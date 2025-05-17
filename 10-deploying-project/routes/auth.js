const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const router = express.Router();
const User = require("../model/user");
router.get("/login", authController.getLogin);
router.post(
    "/login",
    check("email").isEmail().withMessage("Please enter a valid email or password.").normalizeEmail().trim(),
    check("password", "Password is not valid").isLength({ min: 5 }).isAlphanumeric().trim(),

    authController.postLogin,
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);
router.post(
    "/signup",
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject("E-mail exists already, please pick a different one.");
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        })

        .custom((value, { req }) => {
            if (value.split("@")[1] === "mail.ru") {
                throw new Error("This email is not available");
            }
            return true;
        })
        .normalizeEmail()
        .trim(),

    body("password", "Please enter a password with only numbers and text and at least 5 characters.")
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password have to match!");
        }
        return true;
    }),
    authController.postSignup,
);

router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
