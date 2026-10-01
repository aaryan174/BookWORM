import express, { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { createPaymentOrderValidator, verifyPaymentValidator } from '../validators/payment.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Webhook requires raw body for HMAC verification
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.webhook);

router.use(authenticate);

router.post('/create-order', createPaymentOrderValidator, PaymentController.createOrder);
router.post('/verify', verifyPaymentValidator, PaymentController.verifyPayment);

export default router;
