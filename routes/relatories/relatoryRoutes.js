import express from 'express';
import relatoriesController from '../../controllers/relatories/relatoriesContrller.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/vendas', authMiddleware, relatoriesController.getVendas);
router.get('/estoque', authMiddleware, relatoriesController.getEstoque);
router.get('/financeiro', authMiddleware, relatoriesController.getFinanceiro);
router.get('/mais-vendidos', authMiddleware, relatoriesController.getMaisVendidos);

export default router;