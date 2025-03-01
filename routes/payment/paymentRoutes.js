import PaymentController from "../../controllers/payment/paymentController.js";
import authMiddleware from "../../middlewares/authMiddleware.js";
import express from 'express';

const router = express.Router();

router.get('/', authMiddleware, PaymentController.listPayments);
router.get('/:id', authMiddleware, PaymentController.getPaymentById);

export default router;