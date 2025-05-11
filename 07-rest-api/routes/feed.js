const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const feedController = require("../controllers/feed");
const isAuth = require("../middleware/is-auth");

const validator = [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
];

// GET /feed/posts
router.get("/posts", isAuth, feedController.getPosts);
// POST /feed/posts
router.post("/post", isAuth, validator, feedController.createPost);

router.get("/post/:postId", isAuth, feedController.getPost);

router.put("/post/:postId", isAuth, validator, feedController.updatePost);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
