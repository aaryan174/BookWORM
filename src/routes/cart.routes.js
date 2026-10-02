import { Router } from 'express';
import { CartController } from '../controllers/cart.controller.js';
import { addToCartValidator, updateCartItemValidator } from '../validators/cart.validator.js';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate, requireRoles('buyer'));

router.get('/', CartController.getCart);
router.post('/items', addToCartValidator, CartController.addItem);
router.patch('/items/:listingId', updateCartItemValidator, CartController.updateQuantity);
router.delete('/items/:listingId', CartController.removeItem);
router.delete('/', CartController.clearCart);

export default router;
