import {product} from "../schemas/productSchema.js";

//Create or add to the database

export const addProduct = async (req, res) => {
    const checkIfproductExist = await product.exists({title:req.body.title});
    if (!checkIfproductExist) {

        
    }
    const productToAdd = await product.insertOne(req.body);
    res.status(201).json(productToAdd);

    if(!checkIfproductExist){
        return res.status(400).json({message: "Product with this title already exists"});
    }
    
        
}
export const getproducts = async (req, res) => {
    try {
        const products = await product.find({});
        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            products: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error retrieving products",
            error: error.message
        });
    }
}
export const getSingleProduct = async (req, res) => {
    const id = req.params.id;
    const getproduct = await product.findById(id);
    res.status(200).json(getproduct);
    }
export const updateProduct = async (req, res) => {
    const ProductId = req.params.id;
    const productToUpdate = await product.findByIdAndUpdate(ProductId, req.body, {new: true,});
    res.status(200).json(productToUpdate);
}
export const deleteProduct = async (req, res) => {
    const ProductId = req.params.id;
    const productToDelete = await product.findByIdAndDelete(ProductId, null, {new: true,});
    res.status(204).json({message: `Product with ID ${ProductId} has been deleted`});
}

export const deleteAllProducts = async (req,res) => {
    await product.deleteMany({});
    return res.status(204).json({message: "All products have been deleted"});
    
}

    