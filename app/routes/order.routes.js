const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authJwt } = require("../middlewares");

router.post("/create-checkout-session", orderController.createCheckoutSession);
router.get("/order/:id", orderController.getOrderById);
router.get(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  orderController.getAllOrders
);

// main = orders/

module.exports = router;
