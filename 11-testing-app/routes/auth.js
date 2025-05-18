const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const validatorSignup = [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject("E-mail address already exists");
                }
            });
        })
        .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().notEmpty(),
];
const validatorStatus = [body("status").trim().notEmpty()];

router.put("/signup", validatorSignup, authController.signup);
router.post("/login", validatorSignup, authController.login);

router.get("/status", isAuth, authController.getUserStatus);
router.patch("/status", isAuth, validatorStatus, authController.updateUserStatus);

module.exports = router;
