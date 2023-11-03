const express = require("express");
const auth = require("../middlewares/auth");
const {
    placeOrder,
    updateOrder,
    getOrderDetails,
    getOrderHistory
} = require("../controllers/orderController");

const orderRouter = express.Router();

// Place an order
orderRouter.post("/place-order", auth, placeOrder);

// Update an order
orderRouter.put("/update-order/:orderId", auth, updateOrder);

// Get order details
orderRouter.get("/order/:orderId", auth, getOrderDetails);

// Get order history for a user
orderRouter.get("/order-history", auth, getOrderHistory);

module.exports = orderRouter;
