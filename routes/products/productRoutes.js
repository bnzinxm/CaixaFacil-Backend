import express from 'express';
import ProductController from '../../controllers/products/productController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import checkOperatorPassword from './../../middlewares/operatorMiddleware.js';

const router = express.Router();

router.get("/", authMiddleware, ProductController.listProducts);
router.post("/", authMiddleware, ProductController.createProduct);
router.get('/:id', authMiddleware, ProductController.getProductById);
router.put('/:id', authMiddleware, checkOperatorPassword, ProductController.updateProduct);
router.delete('/:id', authMiddleware, checkOperatorPassword, ProductController.deleteProduct);

export default router;