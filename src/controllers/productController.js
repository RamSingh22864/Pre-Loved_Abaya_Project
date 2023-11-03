const productModel = require("../models/product");

const createProduct = async (req, res) =>{
    const {productName, description, image, price, size, condition} = req.body;

    if (!Object.values(ProductSizes).includes(size) || !Object.values(ProductConditions).includes(condition)) {
        return res.status(400).json({ message: "Invalid size or condition" });
    }

    try {

    const newProduct = new productModel({
        productName,
        description,
        image,
        price,
        size,
        condition,
        seller: req.userId,
    });

   
       
       const savedProduct = await newProduct.save();
       res.status(201).json(savedProduct);

   } catch (error) {
       console.log(error);
       res.status(500).json({message: "Something went wrong in creating the product"});
   }
   
};

const updateProduct = async (req, res) =>{
    const id = req.params.id;
    const {productName, description, image, price} = req.body;

    const updatedFields = {
        productName: productName,
        description: description,
        image: image,
        price: price,
        
    };
   try {
       const updatedProduct = await productModel.findByIdAndUpdate(id, updatedFields, {new : true});
       res.status(200).json(updatedProduct);
       
   } catch (error) {
       console.log(error);
       res.status(500).json({message: "Something went wrong while updating the product"});
   }

}

const deleteProduct = async (req, res) =>{

   const id = req.params.id;
   try {
       
       const product = await productModel.findByIdAndRemove(id);
       res.status(202).json(product);

   } catch (error) {
       console.log(error);
       res.status(500).json({message: "Something went wrong while deleting the product"});
   }
}

//display product
const getProducts = async (req, res) =>{
    try {
       const products = await productModel.find({isDisabled: false}).populate("seller", "username");
       res.status(200).json(products);

    } catch (error) {
       console.log(error);
       res.status(500).json({message: "Something went wrong while retrieving products"});
    }
}

const getProductDetails = async (req, res) => {
    try{
        const productId = req.params.productId;
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({product})
    } catch (error){
        console.error('Error:', error);
        res.status(500).json({ message: 'Something went wrong while fetching product details' });

    }

}

const searchProducts = async (req, res) => {
    try{
        const {size, condition, maxPrice} = req.body;
        const filter = {
            isDisabled : true,
        }
        if(size){
            filter.size = size;
        }
        if(condition){
            filter.condition = condition;
        }
        if(maxPrice){
            filter.price = {$lte: parseInt(maxPrice)};
        }

        const products = await productModel.find(filter).populate("seller", "username");

    } catch(error){
        console.error(error);
        res.status(500).json({ message: "Something went wrong while searching for products" });

    }

}

module.exports = {
   createProduct,
   updateProduct,
   deleteProduct,
   getProducts, 
   getProductDetails,
   searchProducts,
}