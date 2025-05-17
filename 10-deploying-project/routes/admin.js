const express = require("express");
const { check, body } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const router = express.Router();

const validEditProduct = [
    check("title")
        .notEmpty()
        .withMessage("поле title не должно быть пустым и содержать минимум 5 символов")
        .isLength({ min: 5 })
        .withMessage("поле title должно содержать минимум 5 символов")
        .trim(),
    // check("image").notEmpty().withMessage("поле imageUrl не должно быть пустым")
    // .isURL()
    // .withMessage("поле должно быть url адресом")
    // .trim(),
    check("price")
        .notEmpty()
        .withMessage("Цена обязательна")
        .isNumeric()
        .withMessage("Цена должна быть числом")
        .custom(value => {
            if (Number(value) <= 0) {
                throw new Error("Значение не должно быть меньше или равно 0");
            }
            return true;
        })
        .trim(),
    check("description")
        .notEmpty()
        .withMessage("поле Description не должно быть пустым")
        .isLength({ min: 5 })
        .withMessage("поле Description должно содержать минимум 5 символов")
        .trim(),
];

//trim
// /admin/... => GET
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, validEditProduct, adminController.postAddProduct);
router.get("/products", isAuth, adminController.getProducts);
// //
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product/", isAuth, validEditProduct, adminController.postEditProduct);
// //
// router.post("/delete-product/", isAuth, adminController.postDeleteProduct);
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
