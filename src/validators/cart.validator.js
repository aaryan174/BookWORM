import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const addToCartValidator = [
  body('listingId').isMongoId().withMessage('Valid listing ID required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validateRequest
];

export const updateCartItemValidator = [
  param('listingId').isMongoId().withMessage('Valid listing ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  validateRequest
];
