// const path = require("path");
// const rootDir = require("../util/path");
const isAuth = require("../middleware/is-auth");
const express = require("express");
const shopController = require("../controllers/shop");

const router = express.Router();

router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
//
router.get("/products/:productId", shopController.getProduct);
//
router.get("/cart", isAuth, shopController.getCart);
router.get("/orders", isAuth, shopController.getOrders);
router.get("/checkout", isAuth, shopController.getCheckout);
//
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.post("/create-order", isAuth, shopController.postOrder);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

router.get("/checkout/success", shopController.getCheckoutSuccess);
router.get("/checkout/cancel", shopController.getCheckout);

module.exports = router;
