import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { registerValidator, loginValidator } from '../validators/auth.validator.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, registerValidator, AuthController.register);
router.post('/login', authLimiter, loginValidator, AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);

export default router;
