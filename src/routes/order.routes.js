import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import {
  checkoutSummaryValidator,
  createOrderValidator,
  updateItemStatusValidator
} from '../validators/order.validator.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/checkout-summary', requireRoles('buyer'), checkoutSummaryValidator, OrderController.getCheckoutSummary);
router.post('/', requireRoles('buyer'), createOrderValidator, OrderController.createOrder);
router.post('/:id/cancel', requireRoles('buyer'), OrderController.cancelPendingOrder);
router.get('/', requireRoles('buyer'), OrderController.getBuyerOrders);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', requireRoles('seller', 'admin'), updateItemStatusValidator, OrderController.updateItemStatus);

export default router;
