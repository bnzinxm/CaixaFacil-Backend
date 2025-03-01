import express from 'express';
import authMiddleware from '../../middlewares/authMiddleware.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';
import StockController from '../../controllers/stock/stockController.js';

const router = express.Router();

router.get('/:id', authMiddleware, StockController.getProductStock);
router.put('/:id', authMiddleware, adminMiddleware, StockController.adjustStock);
router.get('/', authMiddleware, StockController.getCategoryStock);
router.put('/', authMiddleware, adminMiddleware, StockController.updateCategoryStock);

export default router;