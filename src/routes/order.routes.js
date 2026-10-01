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

router.post('/checkout-summary', checkoutSummaryValidator, OrderController.getCheckoutSummary);
router.post('/', createOrderValidator, OrderController.createOrder);
router.get('/', OrderController.getBuyerOrders);
router.get('/:id', OrderController.getOrderById);
router.patch('/:id/status', requireRoles('seller', 'admin'), updateItemStatusValidator, OrderController.updateItemStatus);

export default router;
