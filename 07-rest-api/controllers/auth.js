const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const { Error } = require("mongoose");
const jwt = require("jsonwebtoken");
async function signup(req, res, next) {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        error.data = error.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    try {
        const hashedPass = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            password: hashedPass,
            name: name,
        });
        const result = await user.save();
        console.log(result);
        res.status(201).json({ message: "User created!", userId: result._id });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

async function login(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            const error = new Error("A user with this email could not be found.");
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error("Wrong password.");
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            { email: loadedUser.email, userId: loadedUser._id.toString() },
            process.env.SECRET_JWT,
            { expiresIn: "1h" },
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

async function getUserStatus(req, res, next) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ status: user.status });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

async function updateUserStatus(req, res, next) {
    const newStatus = req.body.status;

    try {
        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }
        user.status = newStatus;
        await user.save();

        res.status(200).json({ message: "User status updated" });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

module.exports = { signup, login, getUserStatus, updateUserStatus };
