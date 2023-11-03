const express = require("express");
const auth = require("../middlewares/auth");
const productRouter = express.Router();

const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct, 
    getProductDetails,
    searchProducts,
  } = require("../controllers/productController");
const userModel = require('../models/user');
const {addToCart, removeFromCart, getUserCart, calculateTotalPrice} = require('../controllers/cartController')

//restriction for user role
const checkRole = (roles) => {
    return async (req, res, next) => {
        try{
            const user = await userModel.findById(req.userId);
            if(!user){
                return res.status(404).json({message: "User not found"});
            }
    
            if(roles.includes(user.role)){
                next();
            }
            else{
                return res.status(403).json({message: "Access denied. You donot have a permission to access this action."})
            }

        }catch(error){
            console.error(error)
            res.status(500).json({message: "Something went wrong while checking user role"})
        }


    };
};
// Retrieve all products
productRouter.get("/", auth, getProducts);
// Retrieve product details
productRouter.get("/:productId", auth, getProductDetails);
// Search for products
productRouter.get("/search-products", searchProducts);

productRouter.post("/", auth, checkRole(["seller"]),  createProduct);
// Delete a product
productRouter.delete("/:id", auth, checkRole(["seller"]), deleteProduct);

productRouter.put("/:id", auth, checkRole(["seller"]), updateProduct);
productRouter.post('/add-to-cart/:productId', auth, addToCart);
productRouter.delete('/remove-from-cart/:productId', auth, removeFromCart);
productRouter.get('/cart', auth, getUserCart);
productRouter.get('/cart/total-price', auth, calculateTotalPrice);

module.exports = productRouter;