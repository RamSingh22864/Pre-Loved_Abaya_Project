const Order = require("../models/order");

// Function to place an order
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId; // Extract the user ID from the request
        const { products, totalAmount, shippingAddress, paymentDetails } = req.body;

        // Create a new order document
        const order = new Order({
            user: userId,
            products,
            totalAmount,
            shippingAddress,
            paymentDetails,
        });

        // Save the order to the database
        await order.save();

        res.status(201).json(order); // Return the created order as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while placing the order" });
    }
};

// Function to update an order
const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId; // Extract the order ID from the request params
        const updateData = req.body; // Data to update the order

        // Find the order by ID and update it
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder); // Return the updated order as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while updating the order" });
    }
};

// Function to get order details
const getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.orderId; // Extract the order ID from the request params

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order); // Return the order details as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching order details" });
    }
};

// Function to get order history for a user
const getOrderHistory = async (req, res) => {
    try {
        const userId = req.userId; // Extract the user ID from the request

        // Find all orders related to the user
        const orders = await Order.find({ user: userId });

        res.status(200).json(orders); // Return the order history as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Something went wrong while fetching order history" });
    }
};

module.exports = { placeOrder, updateOrder, getOrderDetails, getOrderHistory };
