import express from "express"
import { addProduct, getproducts, getSingleProduct,updateProduct, deleteProduct
} from "../controllers/productController.js";

const router = express.Router();

router.route('/')
.get(getproducts)
.post(addProduct)

router.route('/:id')
.get(getSingleProduct)
.patch(updateProduct)
.delete(deleteProduct)

export default router;