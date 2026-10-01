import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const checkoutSummaryValidator = [
  body('addressId').isMongoId().withMessage('Valid shipping address ID is required'),
  validateRequest
];

export const createOrderValidator = [
  body('addressId').isMongoId().withMessage('Valid shipping address ID is required'),
  validateRequest
];

export const updateItemStatusValidator = [
  param('id').isMongoId().withMessage('Valid order ID is required'),
  body('itemId').isMongoId().withMessage('Valid order item ID is required'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Valid item status required'),
  validateRequest
];
