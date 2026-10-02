import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validator.middleware.js';

export const onboardSellerValidator = [
  body('storeName').trim().notEmpty().withMessage('Store name is required'),
  body('description').optional().trim(),
  body('gstin').optional().trim(),
  body('panNumber').optional().trim(),
  validateRequest
];

export const createListingValidator = [
  body('bookId').isMongoId().withMessage('Valid canonical book ID required'),
  body('condition')
    .isIn(['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE'])
    .withMessage('Valid book condition required'),
  body('format')
    .optional()
    .isIn(['HARDCOVER', 'PAPERBACK', 'AUDIOBOOK', 'EBOOK']),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Stock quantity must be a non-negative integer'),
  validateRequest
];

export const updateListingValidator = [
  body('price').optional().isFloat({ min: 0 }),
  body('stockQuantity').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SOLD_OUT']),
  body('condition').optional().isIn(['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE']),
  body('descriptionNotes').optional().trim(),
  validateRequest
];
