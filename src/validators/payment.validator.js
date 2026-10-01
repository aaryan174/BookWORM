import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const createPaymentOrderValidator = [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  validateRequest
];

export const verifyPaymentValidator = [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('razorpayOrderId').notEmpty().withMessage('razorpayOrderId is required'),
  body('razorpayPaymentId').notEmpty().withMessage('razorpayPaymentId is required'),
  body('razorpaySignature').notEmpty().withMessage('razorpaySignature is required'),
  validateRequest
];
