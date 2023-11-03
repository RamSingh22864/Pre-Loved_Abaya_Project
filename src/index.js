const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const mongoose = require('mongoose');
// Import the routes
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoute");
const orderRouter = require("./routes/orderRoutes"); 

app.use(express.json());
app.use(cors());

// Define your existing routes
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/orders", orderRouter);

app.get("/", (req, res) => {
    res.send("Welcome to PreLoved Abaya store :)");
});

const PORT = process.env.PORT || 5000;

mongoose.connect("mongodb+srv://admin:saba@cluster0.uczgtiw.mongodb.net")
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log("Server Started");
        });
    })
    .catch((error) => {
        console.log(error);
    });
