import express from 'express';
import SalesController from '../../controllers/sales/salesController.js';
import adminMiddleware from '../../middlewares/adminMiddleware.js';
import authMiddleware from '../../middlewares/authMiddleware.js';
import checkOperatorPassword from '../../middlewares/operatorMiddleware.js';
import validateProducts from '../../middlewares/validateProducts.js';
import validatePaymentMethod from '../../middlewares/validatePaymentMethod.js';
import validatePaymentAmount from '../../middlewares/sales/validatePaymentAmount.js';
import validateSalesTotal from '../../middlewares/sales/validateSalesTotal.js';
import validateStocksAvailability from '../../middlewares/sales/validateStocksAvailability.js';

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateProducts,
    validatePaymentMethod,
    validatePaymentAmount,
    validateSalesTotal,
    validateStocksAvailability,
    SalesController.createSale
);

router.get('/', authMiddleware, adminMiddleware, SalesController.listSales);

router.put(
    '/:id',
    authMiddleware,
    checkOperatorPassword,
    SalesController.updateSale
);

router.delete('/:id', authMiddleware, checkOperatorPassword, SalesController.deleteSale);
router.get('/:id', authMiddleware, SalesController.getSaleById);
router.get('/:id/pagamento', authMiddleware, SalesController.getPaymentStatus);
router.post('/:id/cancelar', authMiddleware, checkOperatorPassword, SalesController.cancelSale);

export default router;