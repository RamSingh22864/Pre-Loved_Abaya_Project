const Cart = require('../models/cart');
const product = require('../models/product');
const productModel = require('../models/product'); // Import the product model

const addToCart = async (req, res) => {
    try{
        const userId = req.userId;
        const productId = req.params.productId;

           // Check if the product exists
        const product = await productModel.findById(productId);
        if(!product){
            return res.status(404).json({message: 'Product not found'});
        }

        // Find the user's cart or create one if it doesn't exist
        let userCart = await Cart.findOne({userId});
        if(!userCart){
            userCart= await Cart.create({userId});
        }

        // Check if the product is already in the cart
        const existingProduct = userCart.products.find((item) => item.product.toString() === productId);


        if (existingProduct){
            // If it's in the cart, increase the quantity
            existingProduct.quantity += 1;
        } else {
            userCart.products.push({product: productId, quantity: 1})
        }
        await userCart.save();

        res.status(200).json({message: "Product added to the cart successfully"})


    } catch(error){
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while adding the product to the cart' });

    }
}

const removeFromCart = async (req, res) => {
    try{
        const userId = req.userId
        const productId = req.params.productId

        // Find the user's cart
        const userCart = await Cart.findOne({userId});

        if(!userCart){
            return res.status(404).json({message: 'Cart not found'})
        }

        // Remove the product from the cart
        userCart.products = userCart.products.filter((item) => item.product.toString() !== productId);


        await userCart.save();
        res.status(200).json({message: 'Product remove from the cart successfully'});

    } catch(error){
        console.error(error);
        res.status(500).json({message:'Something went wrong while removing the product from the cart'});

    }

}


const getUserCart = async (req, res) => {
    try{
        const userId = req.userId;

         // Find the user's cart
         const userCart = await Cart.findOne({userId}).populate('products.product', 'productName');

         if(!userCart){
            return res.status(404).json({message: 'Cart not found'});
         }

         res.status(200).json({cart: userCart})
    } catch (error){
        console.error(error);
        res.status(500).json({message: 'Something went wrong during Cart Display'});
    }
}


const calculateTotalPrice= async (req, res) =>{
    try{
        const userId = req.userId;

        const userCart = await Cart.findOne({userId});
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Calculate the total price by iterating through cart items
        let totalPrice = 0;
        for(const item of userCart.products){
            const product = await productModel.findById(item.product);

            if(product){
                totalPrice += product.price * item.quantity;
            }
        }
        res.status(200).json({'Total Price: ': totalPrice});


    } catch (error){
        console.error(error);
        res.status(500).json({ message: 'Something went wrong while displaying total amount of Cart' });

    }
}



module.exports = {addToCart, removeFromCart, getUserCart, calculateTotalPrice}